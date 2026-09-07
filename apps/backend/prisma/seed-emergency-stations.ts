import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stations = [
  {
    name: 'Bastar Forest Ranger Headquarters',
    phone: '+91-7782-222422',
    type: 'RANGER',
    district: 'Bastar',
    division: 'Bastar',
    latitude: 19.2,
    longitude: 81.7,
    priority: 100,
    capabilities: [
      'FOREST_RESCUE',
      'WILDERNESS_RESPONSE',
      'REMOTE_AREA_SUPPORT',
    ],
  },

  {
    name: 'Jagdalpur Government Medical College',
    phone: '+91-7782-223048',
    type: 'HOSPITAL',
    district: 'Bastar',
    division: 'Bastar',
    latitude: 19.0833,
    longitude: 82.0167,
    priority: 90,
    capabilities: [
      'EMERGENCY_MEDICAL',
      'TRAUMA',
    ],
  },

  {
    name: 'Jagdalpur Police Control Room',
    phone: '+91-7782-220100',
    type: 'POLICE',
    district: 'Bastar',
    division: 'Bastar',
    latitude: 19.07,
    longitude: 82.02,
    priority: 100,
    capabilities: [
      'POLICE_RESPONSE',
      'EMERGENCY_COORDINATION',
    ],
  },

  {
    name: 'Chitrakote Forest Range Office',
    phone: '+91-7782-263011',
    type: 'RANGER',
    district: 'Bastar',
    division: 'Bastar',
    latitude: 19.205,
    longitude: 81.74,
    priority: 95,
    capabilities: [
      'FOREST_RESCUE',
      'WILDERNESS_RESPONSE',
    ],
  },

  {
    name: 'Kawardha Police PCR Station',
    phone: '+91-7754-224333',
    type: 'POLICE',
    district: 'Kabirdham',
    division: 'Kabirdham',
    latitude: 22.0167,
    longitude: 81.25,
    priority: 100,
    capabilities: [
      'POLICE_RESPONSE',
    ],
  },

  {
    name: 'Kawardha Community Health Centre',
    phone: '+91-7754-224411',
    type: 'HOSPITAL',
    district: 'Kabirdham',
    division: 'Kabirdham',
    latitude: 22.02,
    longitude: 81.26,
    priority: 90,
    capabilities: [
      'EMERGENCY_MEDICAL',
    ],
  },

  {
    name: 'Surguja Civil Rescue Camp',
    phone: '+91-7774-222533',
    type: 'RANGER',
    district: 'Surguja',
    division: 'Surguja',
    latitude: 22.8167,
    longitude: 83.2833,
    priority: 95,
    capabilities: [
      'REMOTE_AREA_SUPPORT',
      'RESCUE',
    ],
  },

  {
    name: 'Ambikapur District Hospital',
    phone: '+91-7774-222100',
    type: 'HOSPITAL',
    district: 'Surguja',
    division: 'Surguja',
    latitude: 23.12,
    longitude: 83.2,
    priority: 90,
    capabilities: [
      'EMERGENCY_MEDICAL',
      'TRAUMA',
    ],
  },

  {
    name: 'Raipur State Emergency Operations',
    phone: '+91-771-4000112',
    type: 'POLICE',
    district: 'Raipur',
    division: 'Raipur',
    latitude: 21.2514,
    longitude: 81.6296,
    priority: 100,
    capabilities: [
      'EMERGENCY_COORDINATION',
      'POLICE_RESPONSE',
    ],
  },

  {
    name: 'Dr. BR Ambedkar State Hospital',
    phone: '+91-771-2234500',
    type: 'HOSPITAL',
    district: 'Raipur',
    division: 'Raipur',
    latitude: 21.23,
    longitude: 81.64,
    priority: 90,
    capabilities: [
      'EMERGENCY_MEDICAL',
      'TRAUMA',
    ],
  },
];

async function main() {
  for (const station of stations) {
    await prisma.emergencyStation.upsert({
      where: {
        name: station.name,
      },

      update: {
        phone: station.phone,
        type: station.type,
        district: station.district,
        division: station.division,
        latitude: station.latitude,
        longitude: station.longitude,
        priority: station.priority,
        capabilities: JSON.stringify(station.capabilities),
        active: true,
      },

      create: {
        name: station.name,
        phone: station.phone,
        type: station.type,
        district: station.district,
        division: station.division,
        latitude: station.latitude,
        longitude: station.longitude,
        priority: station.priority,
        capabilities: JSON.stringify(station.capabilities),
        active: true,
      },
    });
  }

  console.log(
    `Seeded ${stations.length} emergency stations.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
