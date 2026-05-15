import mongoose, { Schema } from "mongoose"
import fs from "node:fs"
import path from "node:path"

function loadEnvFromFile(filePath) {
    if (!fs.existsSync(filePath)) return
    const raw = fs.readFileSync(filePath, "utf8")
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eqIdx = trimmed.indexOf("=")
        if (eqIdx <= 0) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^['\"]|['\"]$/g, "")
        if (!(key in process.env)) {
            process.env[key] = value
        }
    }
}

function getArg(name) {
    const arg = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
    if (!arg) return null
    if (arg.includes("=")) return arg.split("=")[1]
    return true
}

function buildFullDaySlots(slotDurationMins) {
    const slots = []
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek += 1) {
        slots.push({
            dayOfWeek,
            startTime: "00:00",
            endTime: "23:59",
            slotDurationMins,
        })
    }
    return slots
}

const userSchema = new Schema(
    {
        role: { type: String },
        name: {
            first: { type: String },
            last: { type: String },
        },
        doctorProfile: {
            availableSlots: [
                {
                    dayOfWeek: Number,
                    startTime: String,
                    endTime: String,
                    slotDurationMins: Number,
                },
            ],
        },
    },
    { strict: false },
)

const freeSlotSchema = new Schema(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        slotDurationMins: { type: Number, default: 30 },
        isActive: { type: Boolean, default: true },
    },
    { strict: false },
)

const User = mongoose.models.User || mongoose.model("User", userSchema)
const FreeSlot = mongoose.models.FreeSlot || mongoose.model("FreeSlot", freeSlotSchema)

async function main() {
    const cwd = process.cwd()
    loadEnvFromFile(path.join(cwd, ".env.local"))
    loadEnvFromFile(path.join(cwd, ".env"))

    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error("Missing MONGODB_URI in environment")
    }

    const apply = Boolean(getArg("apply"))
    const slotDurationMins = Number(getArg("duration") || 30)
    const overwriteUserProfile = getArg("skip-user-profile") ? false : true

    if (!Number.isFinite(slotDurationMins) || slotDurationMins < 5) {
        throw new Error("Invalid --duration. Use a number >= 5")
    }

    const fullDaySlots = buildFullDaySlots(slotDurationMins)

    await mongoose.connect(uri, { autoIndex: false })

    const doctors = await User.find({ role: "doctor" }).select("_id name doctorProfile.availableSlots")
    console.log(`[plan] doctors found: ${doctors.length}`)
    console.log(`[plan] slot template: 7 days, 00:00-23:59, ${slotDurationMins} mins`)
    console.log(`[plan] mode: ${apply ? "APPLY" : "DRY-RUN"}`)

    if (!apply) {
        console.log("[dry-run] No database writes were performed.")
        console.log("[dry-run] Re-run with --apply to execute updates.")
        return
    }

    // Keep existing slot rows clean by removing current FreeSlot docs for each doctor first.
    const doctorIds = doctors.map((d) => d._id)
    await FreeSlot.deleteMany({ doctorId: { $in: doctorIds } })

    if (doctorIds.length > 0) {
        const freeSlotDocs = []
        for (const doctorId of doctorIds) {
            for (const slot of fullDaySlots) {
                freeSlotDocs.push({
                    doctorId,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    slotDurationMins: slot.slotDurationMins,
                    isActive: true,
                })
            }
        }
        await FreeSlot.insertMany(freeSlotDocs, { ordered: false })
    }

    if (overwriteUserProfile) {
        await User.updateMany(
            { role: "doctor" },
            {
                $set: {
                    "doctorProfile.availableSlots": fullDaySlots,
                },
            },
        )
    }

    console.log(`[done] Updated doctors: ${doctors.length}`)
    console.log(`[done] FreeSlot rows inserted: ${doctors.length * 7}`)
    console.log(`[done] User profile slot sync: ${overwriteUserProfile ? "enabled" : "skipped"}`)
}

main()
    .catch((err) => {
        console.error("[error] backfill failed")
        console.error(err)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.connection.close().catch(() => { })
    })
