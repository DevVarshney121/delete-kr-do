/* ==========================================================================
   THE ELITE STAY – MANAGEMENT REPORT
   Centralized Frontend Data Store (Month-wise)
   Easy to update: add or edit records under the desired month below.
   ========================================================================== */

const AVAILABLE_MONTHS = [
    "December 2026",
    "January 2027",
    "February 2027",
    "March 2027",
    "April 2027",
    "May 2027",
    "June 2027",
    "July 2027",
    "August 2027",
    "September 2027",
    "October 2027",
    "November 2027",
    "December 2027"
];

/**
 * Helper to create an empty month skeleton so future months are always ready.
 */
function createEmptyMonthData() {
    return {
        profiles: [],
        payments: [],
        expenses: {
            monthly: [],
            weekly: [],
            dailyAverage: []
        },
        visitors: [],
        beds: {
            rooms: []
        }
    };
}

/**
 * Main month-wise data object controlling the entire website.
 */
const monthlyData = {
    "December 2026": {
        profiles: [
            {
                id: "PRF-DEC-001",
                timestamp: "02 Dec 2026, 10:24 AM",
                email: "amanverma@gmail.com",
                userType: "Student",
                fullName: "Aman Verma",
                mobileNumber: "9876543210",
                collegeName: "GL Bajaj Institute of Technology",
                courseProgram: "BCA",
                whichYear: "2nd Year",
                guardianName: "Rajesh Verma",
                guardianMobile: "9812345678",
                homeAddress: "Sector 62, Noida, Uttar Pradesh",
                bookingDate: "05 Dec 2026",
                shiftingDate: "08 Dec 2026",
                roomNumber: "A-101",
                roomType: "2 Seater",
                bookingAmount: 5000,
                registrationFee: 1000,
                monthlyRent: 7000,
                securityDeposit: 7000,
                paymentMode: "UPI",
                paymentReceipt: "receipt_aman_dec2026.pdf",
                aadhaarFront: "aadhaar_front_aman.jpg",
                aadhaarBack: "aadhaar_back_aman.jpg",
                yourId: "student_id_aman.jpg",
                employeeFullName: "",
                employeeMobile: "",
                companyName: "",
                companyAddress: ""
            },
            {
                id: "PRF-DEC-002",
                timestamp: "05 Dec 2026, 03:18 PM",
                email: "priyasharma@gmail.com",
                userType: "Student",
                fullName: "Priya Sharma",
                mobileNumber: "9988776655",
                collegeName: "Galgotias University",
                courseProgram: "B.Tech CSE",
                whichYear: "3rd Year",
                guardianName: "Suresh Sharma",
                guardianMobile: "9811223344",
                homeAddress: "Civil Lines, Prayagraj, Uttar Pradesh",
                bookingDate: "05 Dec 2026",
                shiftingDate: "10 Dec 2026",
                roomNumber: "A-102",
                roomType: "3 Seater",
                bookingAmount: 5000,
                registrationFee: 1000,
                monthlyRent: 6500,
                securityDeposit: 6500,
                paymentMode: "Online",
                paymentReceipt: "receipt_priya_dec2026.pdf",
                aadhaarFront: "aadhaar_front_priya.jpg",
                aadhaarBack: "aadhaar_back_priya.jpg",
                yourId: "student_id_priya.jpg",
                employeeFullName: "",
                employeeMobile: "",
                companyName: "",
                companyAddress: ""
            },
            {
                id: "PRF-DEC-003",
                timestamp: "28 Dec 2026, 11:07 AM",
                email: "rohitsingh@gmail.com",
                userType: "Employee",
                fullName: "Rohit Singh",
                mobileNumber: "9123456780",
                collegeName: "",
                courseProgram: "",
                whichYear: "",
                guardianName: "Mahesh Singh",
                guardianMobile: "9765432109",
                homeAddress: "Gomti Nagar, Lucknow, Uttar Pradesh",
                bookingDate: "26 Dec 2026",
                shiftingDate: "29 Dec 2026",
                roomNumber: "B-201",
                roomType: "1 Seater",
                bookingAmount: 6000,
                registrationFee: 1000,
                monthlyRent: 11000,
                securityDeposit: 11000,
                paymentMode: "Cash",
                paymentReceipt: "receipt_rohit_dec2026.pdf",
                aadhaarFront: "aadhaar_front_rohit.jpg",
                aadhaarBack: "aadhaar_back_rohit.jpg",
                yourId: "emp_id_rohit.jpg",
                employeeFullName: "Rohit Singh",
                employeeMobile: "9123456780",
                companyName: "Infosys Technologies",
                companyAddress: "Sector 135, Noida Expressway, UP"
            },
            {
                id: "PRF-DEC-004",
                timestamp: "10 Dec 2026, 01:45 PM",
                email: "nikitagupta@gmail.com",
                userType: "Student",
                fullName: "Nikita Gupta",
                mobileNumber: "9876501234",
                collegeName: "Sharda University",
                courseProgram: "MBA",
                whichYear: "1st Year",
                guardianName: "Ramesh Gupta",
                guardianMobile: "9898765432",
                homeAddress: "Varanasi, Uttar Pradesh",
                bookingDate: "09 Dec 2026",
                shiftingDate: "12 Dec 2026",
                roomNumber: "A-103",
                roomType: "3 Seater",
                bookingAmount: 4000,
                registrationFee: 1000,
                monthlyRent: 6500,
                securityDeposit: 6500,
                paymentMode: "UPI",
                paymentReceipt: "receipt_nikita_dec2026.pdf",
                aadhaarFront: "aadhaar_front_nikita.jpg",
                aadhaarBack: "aadhaar_back_nikita.jpg",
                yourId: "student_id_nikita.jpg",
                employeeFullName: "",
                employeeMobile: "",
                companyName: "",
                companyAddress: ""
            },
            {
                id: "PRF-DEC-005",
                timestamp: "14 Dec 2026, 05:20 PM",
                email: "rohitkumar@gmail.com",
                userType: "Employee",
                fullName: "Rohit Kumar",
                mobileNumber: "9012345678",
                collegeName: "",
                courseProgram: "",
                whichYear: "",
                guardianName: "Dinesh Kumar",
                guardianMobile: "9900112233",
                homeAddress: "Kanpur, Uttar Pradesh",
                bookingDate: "13 Dec 2026",
                shiftingDate: "15 Dec 2026",
                roomNumber: "B-202",
                roomType: "2 Seater",
                bookingAmount: 5000,
                registrationFee: 1000,
                monthlyRent: 8000,
                securityDeposit: 8000,
                paymentMode: "Online",
                paymentReceipt: "receipt_rohitk_dec2026.pdf",
                aadhaarFront: "aadhaar_front_rohitk.jpg",
                aadhaarBack: "aadhaar_back_rohitk.jpg",
                yourId: "emp_id_rohitk.jpg",
                employeeFullName: "Rohit Kumar",
                employeeMobile: "9012345678",
                companyName: "TCS Digital Hub",
                companyAddress: "Sector 62, Noida, UP"
            }
        ],

        payments: [
            {
                id: "PAY-DEC-001",
                timestamp: "02 Dec 2026, 10:24 AM",
                email: "amanverma@gmail.com",
                userType: "Student",
                fullName: "Aman Verma",
                mobileNumber: "9876543210",
                roomNumber: "A-101",
                roomType: "2 Seater",
                feeMonth: "Dec 2026",
                monthlyRent: 7000,
                amountType: "Monthly Rent",
                amountPaid: 7000,
                paymentDate: "02 Dec 2026",
                paymentMode: "UPI",
                status: "Paid",
                receipt: "pay_aman_dec2026.jpg",
                rating: 5
            },
            {
                id: "PAY-DEC-002",
                timestamp: "05 Dec 2026, 03:18 PM",
                email: "priyasharma@gmail.com",
                userType: "Student",
                fullName: "Priya Sharma",
                mobileNumber: "9988776655",
                roomNumber: "A-102",
                roomType: "3 Seater",
                feeMonth: "Dec 2026",
                monthlyRent: 6500,
                amountType: "Booking Amount",
                amountPaid: 5000,
                paymentDate: "05 Dec 2026",
                paymentMode: "Online",
                status: "Paid",
                receipt: "pay_priya_dec2026.jpg",
                rating: 4
            },
            {
                id: "PAY-DEC-003",
                timestamp: "10 Dec 2026, 01:55 PM",
                email: "nikitagupta@gmail.com",
                userType: "Student",
                fullName: "Nikita Gupta",
                mobileNumber: "9876501234",
                roomNumber: "A-103",
                roomType: "3 Seater",
                feeMonth: "Dec 2026",
                monthlyRent: 6500,
                amountType: "Security Deposit",
                amountPaid: 6500,
                paymentDate: "10 Dec 2026",
                paymentMode: "UPI",
                status: "Paid",
                receipt: "pay_nikita_dec2026.jpg",
                rating: 5
            },
            {
                id: "PAY-DEC-004",
                timestamp: "14 Dec 2026, 05:30 PM",
                email: "rohitkumar@gmail.com",
                userType: "Employee",
                fullName: "Rohit Kumar",
                mobileNumber: "9012345678",
                roomNumber: "B-202",
                roomType: "2 Seater",
                feeMonth: "Dec 2026",
                monthlyRent: 8000,
                amountType: "Registration Fee",
                amountPaid: 1000,
                paymentDate: "14 Dec 2026",
                paymentMode: "Online",
                status: "Paid",
                receipt: "pay_rohitk_dec2026.jpg",
                rating: 4
            },
            {
                id: "PAY-DEC-005",
                timestamp: "28 Dec 2026, 11:07 AM",
                email: "rohitsingh@gmail.com",
                userType: "Employee",
                fullName: "Rohit Singh",
                mobileNumber: "9123456780",
                roomNumber: "B-201",
                roomType: "1 Seater",
                feeMonth: "Dec 2026",
                monthlyRent: 11000,
                amountType: "Monthly Rent",
                amountPaid: 3000,
                paymentDate: "28 Dec 2026",
                paymentMode: "Cash",
                status: "Pending",
                receipt: "pay_rohit_dec2026.jpg",
                rating: 4
            }
        ],

        expenses: {
            monthly: [
                {
                    id: "EXP-M-DEC-1",
                    yourName: "Dev Gupta",
                    date: "01 Dec 2026",
                    receipt: "monthly_bills_dec2026.pdf",
                    items: {
                        "Property Rent": 85000,
                        "Electricity Bill": 12500,
                        "Water Bill": 2800,
                        "Internet / Wi-Fi": 1200,
                        "Worker Salary": 15000,
                        "Monthly Ration": 18000,
                        "LPG / Gas": 3200,
                        "Cleaning Material": 2000,
                        "Furniture / Equipment": 5000,
                        "CCTV / Security System": 4500,
                        "License / Government Fees": 3000,
                        "Food Service Expense": 28000,
                        "Miscellaneous / Other": 4800
                    }
                }
            ],
            weekly: [
                {
                    id: "EXP-W-DEC-1",
                    weekLabel: "Week 1",
                    dateRange: "01 Dec – 07 Dec",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w1_dec2026.jpg",
                    items: {
                        "Vegetables": 2200,
                        "Grocery": 2800,
                        "Cleaning Material": 600,
                        "Transportation / Delivery": 800,
                        "Other Expense": 600
                    }
                },
                {
                    id: "EXP-W-DEC-2",
                    weekLabel: "Week 2",
                    dateRange: "08 Dec – 14 Dec",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w2_dec2026.jpg",
                    items: {
                        "Vegetables": 2000,
                        "Grocery": 2600,
                        "Cleaning Material": 500,
                        "Transportation / Delivery": 900,
                        "Other Expense": 500
                    }
                },
                {
                    id: "EXP-W-DEC-3",
                    weekLabel: "Week 3",
                    dateRange: "15 Dec – 21 Dec",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w3_dec2026.jpg",
                    items: {
                        "Vegetables": 2400,
                        "Grocery": 3000,
                        "Cleaning Material": 700,
                        "Transportation / Delivery": 800,
                        "Other Expense": 600
                    }
                },
                {
                    id: "EXP-W-DEC-4",
                    weekLabel: "Week 4",
                    dateRange: "22 Dec – 28 Dec",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w4_dec2026.jpg",
                    items: {
                        "Vegetables": 2300,
                        "Grocery": 2900,
                        "Cleaning Material": 600,
                        "Transportation / Delivery": 1000,
                        "Other Expense": 700
                    }
                }
            ],
            dailyAverage: [
                {
                    id: "EXP-D-DEC-1",
                    yourName: "Dev Gupta",
                    note: "Average daily operational expense for December 2026.",
                    receipt: "daily_avg_dec2026.jpg",
                    items: {
                        "Petrol": 400,
                        "Milk": 900,
                        "Fresh Vegetables": 1100,
                        "Small Repair / Hardware": 350,
                        "Daily Labour": 550,
                        "Cleaning / Consumables": 400,
                        "Other Expense": 300
                    }
                }
            ]
        },

        /* Preserved existing Visitor Enquiries records */
        visitors: [
            { timestamp: "01 Dec 2026, 10:24 AM", fullName: "Aman Verma", mobileNumber: "9876543210", roomRequired: "Yes", source: "Google" },
            { timestamp: "02 Dec 2026, 11:05 AM", fullName: "Rahul Singh", mobileNumber: "9123456780", roomRequired: "Yes", source: "Instagram" },
            { timestamp: "03 Dec 2026, 02:18 PM", fullName: "Priya Sharma", mobileNumber: "9988776655", roomRequired: "No", source: "Friend / Reference" },
            { timestamp: "04 Dec 2026, 04:30 PM", fullName: "Nikita Gupta", mobileNumber: "9876501234", roomRequired: "Yes", source: "Google" },
            { timestamp: "05 Dec 2026, 12:10 PM", fullName: "Rohit Kumar", mobileNumber: "9012345678", roomRequired: "No", source: "Other" }
        ],

        beds: {
            rooms: [
                { roomNumber: "G-01", floor: "Ground Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 2, students: ["Arjun Mehta", "Karan Yadav"] },
                { roomNumber: "G-02", floor: "Ground Floor", roomType: "3 Seater", totalBeds: 3, occupiedBeds: 2, students: ["Vikas Tiwari", "Saurabh Rai"] },
                { roomNumber: "G-03", floor: "Ground Floor", roomType: "1 Seater", totalBeds: 1, occupiedBeds: 0, students: [] },
                { roomNumber: "A-101", floor: "1st Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 2, students: ["Aman Verma", "Deepak Joshi"] },
                { roomNumber: "A-102", floor: "1st Floor", roomType: "3 Seater", totalBeds: 3, occupiedBeds: 3, students: ["Priya Sharma", "Ananya Roy", "Sneha Patel"] },
                { roomNumber: "A-103", floor: "1st Floor", roomType: "3 Seater", totalBeds: 3, occupiedBeds: 2, students: ["Nikita Gupta", "Riya Kapoor"] },
                { roomNumber: "B-201", floor: "2nd Floor", roomType: "1 Seater", totalBeds: 1, occupiedBeds: 1, students: ["Rohit Singh"] },
                { roomNumber: "B-202", floor: "2nd Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 1, students: ["Rohit Kumar"] },
                { roomNumber: "B-203", floor: "2nd Floor", roomType: "4 Seater", totalBeds: 4, occupiedBeds: 3, students: ["Mohit Dubey", "Ankit Jain", "Harsh Mishra"] },
                { roomNumber: "C-301", floor: "3rd Floor", roomType: "4 Seater", totalBeds: 4, occupiedBeds: 2, students: ["Shubham Rao", "Nitin Pandey"] },
                { roomNumber: "C-302", floor: "3rd Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 0, students: [] },
                { roomNumber: "C-303", floor: "3rd Floor", roomType: "1 Seater", totalBeds: 1, occupiedBeds: 1, students: ["Varun Saxena"] }
            ]
        }
    },

    "January 2027": {
        profiles: [
            {
                id: "PRF-JAN-001",
                timestamp: "03 Jan 2027, 09:40 AM",
                email: "siddharth.jain@gmail.com",
                userType: "Student",
                fullName: "Siddharth Jain",
                mobileNumber: "9811002233",
                collegeName: "Bennett University",
                courseProgram: "B.Tech AI",
                whichYear: "1st Year",
                guardianName: "Pradeep Jain",
                guardianMobile: "9811009988",
                homeAddress: "Jaipur, Rajasthan",
                bookingDate: "02 Jan 2027",
                shiftingDate: "05 Jan 2027",
                roomNumber: "A-101",
                roomType: "2 Seater",
                bookingAmount: 5000,
                registrationFee: 1000,
                monthlyRent: 7500,
                securityDeposit: 7500,
                paymentMode: "UPI",
                paymentReceipt: "receipt_siddharth_jan2027.pdf",
                aadhaarFront: "aadhaar_front_sid.jpg",
                aadhaarBack: "aadhaar_back_sid.jpg",
                yourId: "student_id_sid.jpg",
                employeeFullName: "",
                employeeMobile: "",
                companyName: "",
                companyAddress: ""
            },
            {
                id: "PRF-JAN-002",
                timestamp: "07 Jan 2027, 04:15 PM",
                email: "megha.nair@gmail.com",
                userType: "Employee",
                fullName: "Megha Nair",
                mobileNumber: "9871234500",
                collegeName: "",
                courseProgram: "",
                whichYear: "",
                guardianName: "Suresh Nair",
                guardianMobile: "9871230001",
                homeAddress: "Kochi, Kerala",
                bookingDate: "06 Jan 2027",
                shiftingDate: "09 Jan 2027",
                roomNumber: "C-303",
                roomType: "1 Seater",
                bookingAmount: 6000,
                registrationFee: 1000,
                monthlyRent: 11500,
                securityDeposit: 11500,
                paymentMode: "Online",
                paymentReceipt: "receipt_megha_jan2027.pdf",
                aadhaarFront: "aadhaar_front_megha.jpg",
                aadhaarBack: "aadhaar_back_megha.jpg",
                yourId: "emp_id_megha.jpg",
                employeeFullName: "Megha Nair",
                employeeMobile: "9871234500",
                companyName: "HCL Technologies",
                companyAddress: "Sector 126, Noida, UP"
            }
        ],

        payments: [
            {
                id: "PAY-JAN-001",
                timestamp: "03 Jan 2027, 09:45 AM",
                email: "siddharth.jain@gmail.com",
                userType: "Student",
                fullName: "Siddharth Jain",
                mobileNumber: "9811002233",
                roomNumber: "A-101",
                roomType: "2 Seater",
                feeMonth: "Jan 2027",
                monthlyRent: 7500,
                amountType: "Monthly Rent",
                amountPaid: 7500,
                paymentDate: "03 Jan 2027",
                paymentMode: "UPI",
                status: "Paid",
                receipt: "pay_siddharth_jan2027.jpg",
                rating: 5
            },
            {
                id: "PAY-JAN-002",
                timestamp: "07 Jan 2027, 04:20 PM",
                email: "megha.nair@gmail.com",
                userType: "Employee",
                fullName: "Megha Nair",
                mobileNumber: "9871234500",
                roomNumber: "C-303",
                roomType: "1 Seater",
                feeMonth: "Jan 2027",
                monthlyRent: 11500,
                amountType: "Monthly Rent",
                amountPaid: 11500,
                paymentDate: "07 Jan 2027",
                paymentMode: "Online",
                status: "Paid",
                receipt: "pay_megha_jan2027.jpg",
                rating: 5
            },
            {
                id: "PAY-JAN-003",
                timestamp: "10 Jan 2027, 11:30 AM",
                email: "amanverma@gmail.com",
                userType: "Student",
                fullName: "Aman Verma",
                mobileNumber: "9876543210",
                roomNumber: "A-101",
                roomType: "2 Seater",
                feeMonth: "Jan 2027",
                monthlyRent: 7000,
                amountType: "Monthly Rent",
                amountPaid: 4000,
                paymentDate: "10 Jan 2027",
                paymentMode: "UPI",
                status: "Pending",
                receipt: "pay_aman_jan2027.jpg",
                rating: 4
            }
        ],

        expenses: {
            monthly: [
                {
                    id: "EXP-M-JAN-1",
                    yourName: "Dev Gupta",
                    date: "01 Jan 2027",
                    receipt: "monthly_bills_jan2027.pdf",
                    items: {
                        "Property Rent": 85000,
                        "Electricity Bill": 14000,
                        "Water Bill": 2800,
                        "Internet / Wi-Fi": 1200,
                        "Worker Salary": 16000,
                        "Monthly Ration": 19500,
                        "LPG / Gas": 3500,
                        "Cleaning Material": 2200,
                        "Furniture / Equipment": 3500,
                        "CCTV / Security System": 4500,
                        "License / Government Fees": 3000,
                        "Food Service Expense": 29000,
                        "Miscellaneous / Other": 4300
                    }
                }
            ],
            weekly: [
                {
                    id: "EXP-W-JAN-1",
                    weekLabel: "Week 1",
                    dateRange: "01 Jan – 07 Jan",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w1_jan2027.jpg",
                    items: {
                        "Vegetables": 2300,
                        "Grocery": 2900,
                        "Cleaning Material": 650,
                        "Transportation / Delivery": 850,
                        "Other Expense": 500
                    }
                },
                {
                    id: "EXP-W-JAN-2",
                    weekLabel: "Week 2",
                    dateRange: "08 Jan – 14 Jan",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w2_jan2027.jpg",
                    items: {
                        "Vegetables": 2100,
                        "Grocery": 2700,
                        "Cleaning Material": 550,
                        "Transportation / Delivery": 800,
                        "Other Expense": 650
                    }
                },
                {
                    id: "EXP-W-JAN-3",
                    weekLabel: "Week 3",
                    dateRange: "15 Jan – 21 Jan",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w3_jan2027.jpg",
                    items: {
                        "Vegetables": 2400,
                        "Grocery": 3100,
                        "Cleaning Material": 600,
                        "Transportation / Delivery": 900,
                        "Other Expense": 500
                    }
                },
                {
                    id: "EXP-W-JAN-4",
                    weekLabel: "Week 4",
                    dateRange: "22 Jan – 28 Jan",
                    yourName: "Dev Gupta",
                    receipt: "weekly_bill_w4_jan2027.jpg",
                    items: {
                        "Vegetables": 2500,
                        "Grocery": 3000,
                        "Cleaning Material": 700,
                        "Transportation / Delivery": 950,
                        "Other Expense": 650
                    }
                }
            ],
            dailyAverage: [
                {
                    id: "EXP-D-JAN-1",
                    yourName: "Dev Gupta",
                    note: "Average daily operational expense for January 2027.",
                    receipt: "daily_avg_jan2027.jpg",
                    items: {
                        "Petrol": 450,
                        "Milk": 950,
                        "Fresh Vegetables": 1150,
                        "Small Repair / Hardware": 400,
                        "Daily Labour": 600,
                        "Cleaning / Consumables": 400,
                        "Other Expense": 350
                    }
                }
            ]
        },

        visitors: [
            { timestamp: "04 Jan 2027, 11:15 AM", fullName: "Kunal Deshmukh", mobileNumber: "9820112233", roomRequired: "Yes", source: "Google" },
            { timestamp: "06 Jan 2027, 03:40 PM", fullName: "Tanya Malhotra", mobileNumber: "9899887766", roomRequired: "Yes", source: "Instagram" },
            { timestamp: "09 Jan 2027, 01:05 PM", fullName: "Deepak Rawat", mobileNumber: "9711223344", roomRequired: "No", source: "Friend / Reference" }
        ],

        beds: {
            rooms: [
                { roomNumber: "G-01", floor: "Ground Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 2, students: ["Arjun Mehta", "Karan Yadav"] },
                { roomNumber: "G-02", floor: "Ground Floor", roomType: "3 Seater", totalBeds: 3, occupiedBeds: 3, students: ["Vikas Tiwari", "Saurabh Rai", "Kunal Deshmukh"] },
                { roomNumber: "G-03", floor: "Ground Floor", roomType: "1 Seater", totalBeds: 1, occupiedBeds: 1, students: ["Tanya Malhotra"] },
                { roomNumber: "A-101", floor: "1st Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 2, students: ["Aman Verma", "Siddharth Jain"] },
                { roomNumber: "A-102", floor: "1st Floor", roomType: "3 Seater", totalBeds: 3, occupiedBeds: 3, students: ["Priya Sharma", "Ananya Roy", "Sneha Patel"] },
                { roomNumber: "A-103", floor: "1st Floor", roomType: "3 Seater", totalBeds: 3, occupiedBeds: 2, students: ["Nikita Gupta", "Riya Kapoor"] },
                { roomNumber: "B-201", floor: "2nd Floor", roomType: "1 Seater", totalBeds: 1, occupiedBeds: 1, students: ["Rohit Singh"] },
                { roomNumber: "B-202", floor: "2nd Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 2, students: ["Rohit Kumar", "Deepak Joshi"] },
                { roomNumber: "B-203", floor: "2nd Floor", roomType: "4 Seater", totalBeds: 4, occupiedBeds: 3, students: ["Mohit Dubey", "Ankit Jain", "Harsh Mishra"] },
                { roomNumber: "C-301", floor: "3rd Floor", roomType: "4 Seater", totalBeds: 4, occupiedBeds: 2, students: ["Shubham Rao", "Nitin Pandey"] },
                { roomNumber: "C-302", floor: "3rd Floor", roomType: "2 Seater", totalBeds: 2, occupiedBeds: 1, students: ["Rohan Garg"] },
                { roomNumber: "C-303", floor: "3rd Floor", roomType: "1 Seater", totalBeds: 1, occupiedBeds: 1, students: ["Megha Nair"] }
            ]
        }
    }
};

// Automatically initialize remaining months with clean empty structure ready for future data entry
AVAILABLE_MONTHS.forEach(month => {
    if (!monthlyData[month]) {
        monthlyData[month] = createEmptyMonthData();
    }
});

/* Standard field lists for Expense module */
const MONTHLY_EXPENSE_FIELDS = [
    "Property Rent",
    "Electricity Bill",
    "Water Bill",
    "Internet / Wi-Fi",
    "Worker Salary",
    "Monthly Ration",
    "LPG / Gas",
    "Cleaning Material",
    "Furniture / Equipment",
    "CCTV / Security System",
    "License / Government Fees",
    "Food Service Expense",
    "Miscellaneous / Other"
];

const WEEKLY_EXPENSE_FIELDS = [
    "Vegetables",
    "Grocery",
    "Cleaning Material",
    "Transportation / Delivery",
    "Other Expense"
];

const DAILY_EXPENSE_FIELDS = [
    "Petrol",
    "Milk",
    "Fresh Vegetables",
    "Small Repair / Hardware",
    "Daily Labour",
    "Cleaning / Consumables",
    "Other Expense"
];
