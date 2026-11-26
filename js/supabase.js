/* ==========================================================================
   THE ELITE STAY – SUPABASE CLIENT & PROFILE SYNC (PHASE 1)
   Project: the-elite-stay (ap-south-1)
   ========================================================================== */

const SUPABASE_URL = "https://jcsmsvccjfsjsnvwiffy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SqBdo6IgUqhVy5S2WvLDhA_9aY-sZ4Q";
const SUPABASE_MEDIA_BUCKET = "elite-stay-media";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB bucket limit

const supabaseClient = window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

function isSupabaseReady() {
    return Boolean(supabaseClient);
}

function dbRowToProfile(row) {
    return {
        id: row.record_code,
        dbId: row.id,
        monthName: row.month_name,
        timestamp: row.timestamp_label,
        email: row.email || "",
        userType: row.user_type || "Student",
        fullName: row.full_name || "",
        mobileNumber: row.mobile_number || "",
        collegeName: row.college_name || "",
        courseProgram: row.course_program || "",
        whichYear: row.which_year || "",
        guardianName: row.guardian_name || "",
        guardianMobile: row.guardian_mobile || "",
        homeAddress: row.home_address || "",
        bookingDate: row.booking_date || "",
        shiftingDate: row.shifting_date || "",
        roomNumber: row.room_number || "",
        roomType: row.room_type || "2 Seater",
        bookingAmount: Number(row.booking_amount) || 0,
        registrationFee: Number(row.registration_fee) || 0,
        monthlyRent: Number(row.monthly_rent) || 0,
        securityDeposit: Number(row.security_deposit) || 0,
        paymentMode: row.payment_mode || "UPI",
        profilePhoto: row.profile_photo || DEFAULT_IMAGES.profilePhoto,
        paymentReceipt: row.payment_receipt || DEFAULT_IMAGES.paymentReceipt,
        aadhaarFront: row.aadhaar_front || DEFAULT_IMAGES.aadhaarFront,
        aadhaarBack: row.aadhaar_back || DEFAULT_IMAGES.aadhaarBack,
        yourId: row.your_id || DEFAULT_IMAGES.yourId,
        employeeFullName: row.employee_full_name || "",
        employeeMobile: row.employee_mobile || "",
        companyName: row.company_name || "",
        companyAddress: row.company_address || "",
        extraFields: row.extra_fields || {}
    };
}

function profileToDbRow(profile, monthName) {
    return {
        record_code: profile.id,
        month_name: monthName,
        timestamp_label: profile.timestamp,
        user_type: profile.userType,
        full_name: profile.fullName,
        email: profile.email || "",
        mobile_number: profile.mobileNumber || "",
        college_name: profile.collegeName || "",
        course_program: profile.courseProgram || "",
        which_year: profile.whichYear || "",
        guardian_name: profile.guardianName || "",
        guardian_mobile: profile.guardianMobile || "",
        home_address: profile.homeAddress || "",
        booking_date: profile.bookingDate || "",
        shifting_date: profile.shiftingDate || "",
        room_number: profile.roomNumber || "",
        room_type: profile.roomType || "2 Seater",
        booking_amount: Number(profile.bookingAmount) || 0,
        registration_fee: Number(profile.registrationFee) || 0,
        monthly_rent: Number(profile.monthlyRent) || 0,
        security_deposit: Number(profile.securityDeposit) || 0,
        payment_mode: profile.paymentMode || "UPI",
        profile_photo: profile.profilePhoto || DEFAULT_IMAGES.profilePhoto,
        payment_receipt: profile.paymentReceipt || DEFAULT_IMAGES.paymentReceipt,
        aadhaar_front: profile.aadhaarFront || DEFAULT_IMAGES.aadhaarFront,
        aadhaar_back: profile.aadhaarBack || DEFAULT_IMAGES.aadhaarBack,
        your_id: profile.yourId || DEFAULT_IMAGES.yourId,
        employee_full_name: profile.employeeFullName || "",
        employee_mobile: profile.employeeMobile || "",
        company_name: profile.companyName || "",
        company_address: profile.companyAddress || "",
        extra_fields: profile.extraFields || {}
    };
}

async function uploadProfileMediaFile(file, folder) {
    if (!file) return null;
    if (!supabaseClient) throw new Error("Supabase client is not initialized.");
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`"${file.name}" exceeds the 5 MB limit.`);
    }

    const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = rawExt || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const objectPath = `profiles/${folder}/${uniqueName}`;

    const { data, error } = await supabaseClient.storage
        .from(SUPABASE_MEDIA_BUCKET)
        .upload(objectPath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream"
        });

    if (error) {
        throw new Error(`Upload failed (${file.name}): ${error.message}`);
    }

    const { data: urlData } = supabaseClient.storage
        .from(SUPABASE_MEDIA_BUCKET)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

async function fetchProfilesFromSupabase() {
    if (!supabaseClient) {
        return { ok: false, error: "Supabase SDK not loaded." };
    }

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

    if (error) {
        return { ok: false, error: error.message };
    }

    const grouped = {};
    AVAILABLE_MONTHS.forEach(m => { grouped[m] = []; });

    (data || []).forEach(row => {
        if (!grouped[row.month_name]) grouped[row.month_name] = [];
        grouped[row.month_name].push(dbRowToProfile(row));
    });

    AVAILABLE_MONTHS.forEach(m => {
        if (!monthlyData[m]) monthlyData[m] = createEmptyMonthData();
        monthlyData[m].profiles = grouped[m] || [];
    });

    return { ok: true, count: (data || []).length };
}

async function insertProfileToSupabase(profile, monthName) {
    if (!supabaseClient) {
        return { ok: false, error: "Supabase SDK not loaded." };
    }

    const payload = profileToDbRow(profile, monthName);
    const { data, error } = await supabaseClient
        .from("profiles")
        .insert([payload])
        .select()
        .single();

    if (error) {
        return { ok: false, error: error.message };
    }

    return { ok: true, profile: dbRowToProfile(data) };
}
