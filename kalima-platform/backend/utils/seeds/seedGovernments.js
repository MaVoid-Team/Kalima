require('dotenv').config();
const mongoose = require("mongoose");
const government = require("../../models/governmentModel");

const governmentsData = [
    {
        name: "Alexandria",
        administrationZone: [
            "East Educational Administration", "West Educational Administration",
            "Central Educational Administration", "El-Gomrok Educational Administration",
            "Montaza Educational Administration", "Agamy Educational Administration",
            "Amreya Educational Administration"
        ]
    },
    {
        name: "Aswan",
        administrationZone: [
            "Aswan Educational Administration", "Edfu Educational Administration",
            "Kom Ombo Educational Administration", "Nasr El-Nuba Educational Administration",
            "Daraw Educational Administration", "El-Radisiya Educational Administration"
        ]
    },
    {
        name: "Assiut",
        administrationZone: [
            "Assiut Educational Administration", "Dairut Educational Administration",
            "El-Qusiya Educational Administration", "Abnoub Educational Administration",
            "El-Fateh Educational Administration", "Sahel Selim Educational Administration",
            "El-Badari Educational Administration", "Sodfa Educational Administration",
            "El-Ghanayem Educational Administration", "Abu Tig Educational Administration",
            "Manfalut Educational Administration"
        ]
    },
    {
        name: "Beheira",
        administrationZone: [
            "Damanhour Educational Administration", "Kafr El-Dawar Educational Administration",
            "Abu Hummus Educational Administration", "Edko Educational Administration",
            "El-Mahmoudia Educational Administration", "El-Rahmaniya Educational Administration",
            "Kom Hamada Educational Administration", "Itay El-Baroud Educational Administration",
            "Hosh Essa Educational Administration", "Shubrakhit Educational Administration",
            "El-Delengat Educational Administration", "Wadi El-Natrun Educational Administration"
        ]
    },
    {
        name: "Beni Suef",
        administrationZone: [
            "Beni Suef Educational Administration", "El-Wasta Educational Administration",
            "Nasser Educational Administration", "Ihnasia Educational Administration",
            "Beba Educational Administration", "Fashn Educational Administration",
            "Samasta Educational Administration"
        ]
    },
    {
        name: "Cairo",
        administrationZone: [
            "East Cairo Educational Administration", "West Cairo Educational Administration",
            "North Cairo Educational Administration", "South Cairo Educational Administration",
            "Central Cairo Educational Administration", "El-Waili Educational Administration",
            "El-Zeitoun Educational Administration", "Heliopolis Educational Administration",
            "Nasr City Educational Administration", "El-Salam Educational Administration",
            "El-Matariya Educational Administration", "Ain Shams Educational Administration",
            "El-Marg Educational Administration", "El-Shorouk Educational Administration"
        ]
    },
    {
        name: "Dakahlia",
        administrationZone: [
            "Mansoura Educational Administration", "Talkha Educational Administration",
            "Mit Ghamr Educational Administration", "Aga Educational Administration",
            "Sinbillawin Educational Administration", "El-Manzala Educational Administration",
            "Belqas Educational Administration", "Sherbin Educational Administration",
            "Dikirnis Educational Administration", "El-Gammaliya Educational Administration",
            "Mit Salsil Educational Administration", "Nabaroh Educational Administration"
        ]
    },
    {
        name: "Damietta",
        administrationZone: [
            "Damietta Educational Administration", "Faraskour Educational Administration",
            "Kafr Saad Educational Administration", "El-Zarqa Educational Administration",
            "Kafr El-Batikh Educational Administration"
        ]
    },
    {
        name: "Fayoum",
        administrationZone: [
            "Fayoum Educational Administration", "Tamiya Educational Administration",
            "Sinnuris Educational Administration", "Ibshaway Educational Administration",
            "Itsa Educational Administration", "Youssef El Seddik Educational Administration"
        ]
    },
    {
        name: "Gharbia",
        administrationZone: [
            "Tanta Educational Administration", "El-Mahalla El-Kubra Educational Administration",
            "Kafr El-Zayat Educational Administration", "Zefta Educational Administration",
            "El-Santa Educational Administration", "Samannoud Educational Administration",
            "Bassioun Educational Administration", "Qutour Educational Administration"
        ]
    },
    {
        name: "Giza",
        administrationZone: [
            "North Giza Educational Administration", "South Giza Educational Administration",
            "East Giza Educational Administration", "West Giza Educational Administration",
            "6th of October Educational Administration", "El-Haram Educational Administration",
            "El-Dokki Educational Administration", "El-Agouza Educational Administration",
            "El-Wahat Educational Administration", "Atfih Educational Administration"
        ]
    },
    {
        name: "Ismailia",
        administrationZone: [
            "Ismailia Educational Administration", "El-Tal El-Kebir Educational Administration",
            "Fayed Educational Administration", "El-Qantara Educational Administration",
            "Abu Swair Educational Administration", "El-Qassassin Educational Administration"
        ]
    },
    {
        name: "Kafr el-Sheikh",
        administrationZone: [
            "Kafr El-Sheikh Educational Administration", "Desouk Educational Administration",
            "Fuwwah Educational Administration", "Motobas Educational Administration",
            "Baltim Educational Administration", "Sidi Salem Educational Administration",
            "Qalin Educational Administration", "El-Hamoul Educational Administration",
            "El-Riyad Educational Administration", "Bella Educational Administration"
        ]
    },
    {
        name: "Matrouh",
        administrationZone: [
            "Marsa Matrouh Educational Administration", "El-Hamam Educational Administration",
            "El-Alamein Educational Administration", "El-Dabaa Educational Administration",
            "El-Salloum Educational Administration", "Siwa Educational Administration"
        ]
    },
    {
        name: "Minya",
        administrationZone: [
            "Minya Educational Administration", "Abu Qurqas Educational Administration",
            "El-Adwa Educational Administration", "Maghagha Educational Administration",
            "Beni Mazar Educational Administration", "Matai Educational Administration",
            "Samalut Educational Administration", "Mallawi Educational Administration",
            "Dir Mawas Educational Administration"
        ]
    },
    {
        name: "Menofia",
        administrationZone: [
            "Shebin El-Kom Educational Administration", "Menouf Educational Administration",
            "Ashmoun Educational Administration", "Quesna Educational Administration",
            "El-Bagour Educational Administration", "El-Shohada Educational Administration",
            "Berket El-Sab Educational Administration", "Tala Educational Administration",
            "Sers El-Lyan Educational Administration"
        ]
    },
    {
        name: "New Valley",
        administrationZone: [
            "Kharga Educational Administration", "Dakhla Educational Administration",
            "Farafra Educational Administration", "Baris Educational Administration",
            "Balat Educational Administration"
        ]
    },
    {
        name: "North Sinai",
        administrationZone: [
            "El-Arish Educational Administration", "Sheikh Zuweid Educational Administration",
            "Rafah Educational Administration", "Bir al-Abd Educational Administration",
            "El-Hasana Educational Administration", "Nakhl Educational Administration"
        ]
    },
    {
        name: "Port Said",
        administrationZone: [
            "Port Said North Educational Administration", "Port Said South Educational Administration",
            "Port Fouad Educational Administration", "El-Zohor Educational Administration",
            "El-Arab District Educational Administration", "El-Dawahy Educational Administration"
        ]
    },
    {
        name: "Qualyubia",
        administrationZone: [
            "East Shubra El-Kheima Educational Administration",
            "West Shubra El-Kheima Educational Administration",
            "Banha Educational Administration",
            "Khanka Educational Administration",
            "Tukh Educational Administration",
            "Qalyub Educational Administration",
            "Shebin El-Qanater Educational Administration",
            "Kafr Shukr Educational Administration",
            "Obour Educational Administration",
            "Khosous Educational Administration"
        ] // Add zones if available
    },
    {
        name: "Qena",
        administrationZone: [
            "Qena Educational Administration", "Abu Tesht Educational Administration",
            "Nag Hammadi Educational Administration", "Deshna Educational Administration",
            "Farshout Educational Administration", "Qift Educational Administration",
            "Qus Educational Administration", "Naqada Educational Administration"
        ]
    },
    {
        name: "Red Sea",
        administrationZone: [
            "Hurghada Educational Administration", "Ras Gharib Educational Administration",
            "Safaga Educational Administration", "El-Qusair Educational Administration",
            "Marsa Alam Educational Administration", "Shalatin Educational Administration",
            "Halayeb Educational Administration"
        ]
    },
    {
        name: "Al-Sharqia",
        administrationZone: [
            "Zagazig Educational Administration", "Fakous Educational Administration",
            "Hehia Educational Administration", "Abu Hammad Educational Administration",
            "Abu Kebir Educational Administration", "El-Ibrahimia Educational Administration",
            "Belbeis Educational Administration", "Menia El-Kamh Educational Administration",
            "Diarb Negm Educational Administration", "Kafr Saqr Educational Administration",
            "Mashtool El-Souk Educational Administration"
        ]
    },
    {
        name: "Sohag",
        administrationZone: [
            "Sohag Educational Administration", "Akhmim Educational Administration",
            "El-Balyana Educational Administration", "El-Maragha Educational Administration",
            "Dar El-Salam Educational Administration", "Gerga Educational Administration",
            "Juhayna Educational Administration", "Sakulta Educational Administration",
            "Tama Educational Administration", "Tahta Educational Administration",
            "El-Munsha Educational Administration"
        ]
    },
    {
        name: "South Sinai",
        administrationZone: [
            "El-Tor Educational Administration", "Sharm El-Sheikh Educational Administration",
            "Dahab Educational Administration", "Nuweiba Educational Administration",
            "Saint Catherine Educational Administration", "Abu Rudeis Educational Administration",
            "Ras Sidr Educational Administration"
        ]
    },
    {
        name: "Suez",
        administrationZone: [
            "Suez Educational Administration", "El-Arbaeen Educational Administration",
            "Ataqah Educational Administration", "El-Ganayen Educational Administration",
            "Faisal Educational Administration"
        ]
    },
    {
        name: "Luxor",
        administrationZone: [
            "Luxor Educational Administration", "Armant Educational Administration",
            "Esna Educational Administration", "El-Tod Educational Administration",
            "El-Qurna Educational Administration"
        ]
    }
];

async function seedGovernments() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Connected to MongoDB.");
        console.log("Clearing existing governments...");
        await government.deleteMany({});
        console.log("Inserting new governments...");
        await government.insertMany(governmentsData);
        console.log("Governments seeded!");
    } catch (err) {
        console.error("Error seeding governments:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

seedGovernments();
