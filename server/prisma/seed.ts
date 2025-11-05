import { PrismaClient, UserRole, OrderStatus, BookingStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.message.deleteMany();
  await prisma.file.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.projectUpdate.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.protocol.deleteMany();
  await prisma.reagent.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.chen@biolab.edu',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Chen',
        role: UserRole.PI_LAB_MANAGER,
        labAffiliation: 'Chen Molecular Biology Lab',
        profileImage: 'https://i.pravatar.cc/150?img=1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'michael.rodriguez@biolab.edu',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Rodriguez',
        role: UserRole.POSTDOC_STAFF,
        labAffiliation: 'Chen Molecular Biology Lab',
        profileImage: 'https://i.pravatar.cc/150?img=2',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emily.zhang@biolab.edu',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Zhang',
        role: UserRole.GRAD_STUDENT,
        labAffiliation: 'Chen Molecular Biology Lab',
        profileImage: 'https://i.pravatar.cc/150?img=3',
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.wilson@biolab.edu',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Wilson',
        role: UserRole.GRAD_STUDENT,
        labAffiliation: 'Chen Molecular Biology Lab',
        profileImage: 'https://i.pravatar.cc/150?img=4',
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex.patel@biolab.edu',
        password: hashedPassword,
        firstName: 'Alex',
        lastName: 'Patel',
        role: UserRole.UNDERGRAD_TECH,
        labAffiliation: 'Chen Molecular Biology Lab',
        profileImage: 'https://i.pravatar.cc/150?img=5',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'CRISPR Gene Editing Study',
        description: 'Investigating CRISPR-Cas9 efficiency in human cell lines',
        progress: 65,
        status: 'active',
        budget: 50000,
        budgetUsed: 22500,
        targetEndDate: new Date('2025-06-30'),
        ownerId: users[0].id,
        members: {
          create: [
            { userId: users[1].id, role: 'member' },
            { userId: users[2].id, role: 'member' },
          ],
        },
        updates: {
          create: [
            {
              content: 'Successfully transfected HEK293 cells with new construct',
              milestone: true,
              createdBy: users[1].id,
            },
            {
              content: 'Analyzing sequencing results from last week\'s experiment',
              milestone: false,
              createdBy: users[2].id,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Protein Expression Optimization',
        description: 'Optimizing recombinant protein expression in E. coli',
        progress: 40,
        status: 'active',
        budget: 35000,
        budgetUsed: 15000,
        targetEndDate: new Date('2025-08-15'),
        ownerId: users[1].id,
        members: {
          create: [
            { userId: users[3].id, role: 'member' },
            { userId: users[4].id, role: 'viewer' },
          ],
        },
        updates: {
          create: [
            {
              content: 'Testing new induction conditions with IPTG',
              milestone: false,
              createdBy: users[3].id,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Cell Signaling Pathway Analysis',
        description: 'Mapping novel signaling pathways in cancer cells',
        progress: 80,
        status: 'active',
        budget: 60000,
        budgetUsed: 48000,
        targetEndDate: new Date('2025-05-01'),
        ownerId: users[0].id,
        members: {
          create: [
            { userId: users[2].id, role: 'member' },
          ],
        },
        updates: {
          create: [
            {
              content: 'Manuscript submitted to Nature Cell Biology!',
              milestone: true,
              createdBy: users[0].id,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create protocols
  const protocols = await Promise.all([
    prisma.protocol.create({
      data: {
        name: 'Western Blot Protocol',
        description: 'Standard protocol for protein detection',
        version: '2.1',
        content: '# Western Blot Protocol\n\n## Materials\n- PVDF membrane\n- Transfer buffer\n- Blocking buffer\n\n## Procedure\n1. Transfer proteins to membrane\n2. Block for 1 hour\n3. Incubate with primary antibody overnight...',
        category: 'Protein Analysis',
        tags: ['western blot', 'protein', 'antibody'],
        isPublic: true,
        createdBy: users[1].id,
      },
    }),
    prisma.protocol.create({
      data: {
        name: 'PCR Amplification',
        description: 'Standard PCR protocol for gene amplification',
        version: '1.5',
        content: '# PCR Protocol\n\n## Materials\n- DNA template\n- Primers\n- Taq polymerase\n- dNTPs\n\n## Procedure\n1. Prepare master mix\n2. Add template\n3. Run PCR cycle...',
        category: 'Molecular Biology',
        tags: ['PCR', 'DNA', 'amplification'],
        isPublic: true,
        createdBy: users[0].id,
      },
    }),
    prisma.protocol.create({
      data: {
        name: 'Cell Culture Maintenance',
        description: 'Routine cell culture passage and maintenance',
        version: '3.0',
        content: '# Cell Culture Maintenance\n\n## Materials\n- Cell culture media\n- PBS\n- Trypsin\n\n## Procedure\n1. Warm media to 37°C\n2. Aspirate old media\n3. Wash with PBS...',
        category: 'Cell Culture',
        tags: ['cell culture', 'passage', 'maintenance'],
        isPublic: true,
        createdBy: users[2].id,
      },
    }),
    prisma.protocol.create({
      data: {
        name: 'Immunofluorescence Staining',
        description: 'Protocol for fluorescent antibody staining',
        version: '1.8',
        content: '# Immunofluorescence Protocol\n\n## Materials\n- Primary antibody\n- Secondary antibody\n- DAPI\n- Mounting medium\n\n## Procedure\n1. Fix cells with 4% PFA\n2. Permeabilize with Triton X-100\n3. Block with serum...',
        category: 'Microscopy',
        tags: ['immunofluorescence', 'antibody', 'microscopy'],
        isPublic: true,
        createdBy: users[1].id,
      },
    }),
    prisma.protocol.create({
      data: {
        name: 'Plasmid DNA Extraction',
        description: 'Mini-prep protocol for plasmid DNA isolation',
        version: '2.0',
        content: '# Plasmid Mini-Prep\n\n## Materials\n- Bacterial culture\n- Lysis buffer\n- Neutralization buffer\n- Wash buffer\n\n## Procedure\n1. Pellet bacterial cells\n2. Resuspend in lysis buffer\n3. Add neutralization buffer...',
        category: 'Molecular Biology',
        tags: ['plasmid', 'DNA', 'mini-prep'],
        isPublic: true,
        createdBy: users[3].id,
      },
    }),
  ]);

  console.log(`Created ${protocols.length} protocols`);

  // Create reagents
  const reagents = await Promise.all([
    prisma.reagent.create({
      data: {
        name: 'DMEM High Glucose Media',
        barcode: '123456789001',
        vendor: 'ThermoFisher',
        catalogNumber: '11965-092',
        lotNumber: 'LOT2024-A123',
        quantity: 250,
        unit: 'mL',
        lowStockThreshold: 500,
        storageLocation: 'Cold Room, Shelf 2',
        storageTemp: '4°C',
        handlingNotes: 'Keep refrigerated. Warm to 37°C before use.',
        receivedDate: new Date('2024-10-15'),
        expirationDate: new Date('2025-06-30'),
        isLowStock: true,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'Taq DNA Polymerase',
        barcode: '123456789002',
        vendor: 'New England Biolabs',
        catalogNumber: 'M0273L',
        lotNumber: 'LOT2024-B456',
        quantity: 50,
        unit: 'units',
        lowStockThreshold: 100,
        storageLocation: 'Freezer Box 1, Position A1',
        storageTemp: '-20°C',
        handlingNotes: 'Keep frozen. Avoid freeze-thaw cycles.',
        receivedDate: new Date('2024-09-20'),
        expirationDate: new Date('2026-09-20'),
        isLowStock: true,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'Anti-GAPDH Antibody',
        barcode: '123456789003',
        vendor: 'Cell Signaling Technology',
        catalogNumber: '#2118',
        lotNumber: 'LOT2024-C789',
        quantity: 0.5,
        unit: 'mL',
        lowStockThreshold: 0.2,
        storageLocation: 'Freezer Box 2, Position B3',
        storageTemp: '-20°C',
        handlingNotes: 'Store in aliquots. Use at 1:1000 dilution.',
        receivedDate: new Date('2024-08-10'),
        expirationDate: new Date('2025-08-10'),
        isLowStock: false,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'PBS 10X Stock',
        barcode: '123456789004',
        vendor: 'Sigma-Aldrich',
        catalogNumber: 'P5493',
        lotNumber: 'LOT2024-D012',
        quantity: 5000,
        unit: 'mL',
        lowStockThreshold: 1000,
        storageLocation: 'RT Cabinet, Shelf 3',
        storageTemp: 'Room Temperature',
        handlingNotes: 'Dilute 1:10 before use.',
        receivedDate: new Date('2024-11-01'),
        expirationDate: new Date('2026-11-01'),
        isLowStock: false,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'DAPI Stain',
        barcode: '123456789005',
        vendor: 'ThermoFisher',
        catalogNumber: 'D1306',
        lotNumber: 'LOT2024-E345',
        quantity: 10,
        unit: 'mL',
        lowStockThreshold: 5,
        storageLocation: 'Freezer Box 3, Position C2',
        storageTemp: '-20°C',
        handlingNotes: 'Light sensitive. Store in dark. Use at 1:10000 dilution.',
        receivedDate: new Date('2024-07-15'),
        expirationDate: new Date('2025-02-15'),
        isLowStock: false,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'Trypsin-EDTA Solution',
        barcode: '123456789006',
        vendor: 'Gibco',
        catalogNumber: '25200-056',
        lotNumber: 'LOT2024-F678',
        quantity: 100,
        unit: 'mL',
        lowStockThreshold: 200,
        storageLocation: 'Cold Room, Shelf 1',
        storageTemp: '4°C',
        handlingNotes: 'Keep cold. Warm to 37°C before use.',
        receivedDate: new Date('2024-10-01'),
        expirationDate: new Date('2025-04-01'),
        isLowStock: true,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'Ethanol 95%',
        barcode: '123456789007',
        vendor: 'VWR',
        catalogNumber: 'E190',
        lotNumber: 'LOT2024-G901',
        quantity: 15000,
        unit: 'mL',
        lowStockThreshold: 5000,
        storageLocation: 'Flammables Cabinet',
        storageTemp: 'Room Temperature',
        handlingNotes: 'Flammable. Store away from heat. Use in fume hood.',
        receivedDate: new Date('2024-09-01'),
        expirationDate: null,
        isLowStock: false,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'Ampicillin Sodium Salt',
        barcode: '123456789008',
        vendor: 'Sigma-Aldrich',
        catalogNumber: 'A9518',
        lotNumber: 'LOT2024-H234',
        quantity: 5,
        unit: 'g',
        lowStockThreshold: 10,
        storageLocation: 'Freezer Box 1, Position D4',
        storageTemp: '-20°C',
        handlingNotes: 'Make fresh stocks. Filter sterilize before use.',
        receivedDate: new Date('2024-08-01'),
        expirationDate: new Date('2026-08-01'),
        isLowStock: true,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'Fetal Bovine Serum',
        barcode: '123456789009',
        vendor: 'Gibco',
        catalogNumber: '10270-106',
        lotNumber: 'LOT2024-I567',
        quantity: 450,
        unit: 'mL',
        lowStockThreshold: 500,
        storageLocation: 'Freezer Box 4, Position E1',
        storageTemp: '-20°C',
        handlingNotes: 'Heat inactivate at 56°C for 30 min. Aliquot before use.',
        receivedDate: new Date('2024-06-01'),
        expirationDate: new Date('2025-06-01'),
        isLowStock: true,
      },
    }),
    prisma.reagent.create({
      data: {
        name: 'RIPA Lysis Buffer',
        barcode: '123456789010',
        vendor: 'Cell Signaling Technology',
        catalogNumber: '#9806',
        lotNumber: 'LOT2024-J890',
        quantity: 200,
        unit: 'mL',
        lowStockThreshold: 100,
        storageLocation: 'Cold Room, Shelf 3',
        storageTemp: '4°C',
        handlingNotes: 'Add protease inhibitors before use. Keep cold.',
        receivedDate: new Date('2024-09-15'),
        expirationDate: new Date('2025-09-15'),
        isLowStock: false,
      },
    }),
  ]);

  console.log(`Created ${reagents.length} reagents`);

  // Create equipment
  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        name: 'Confocal Microscope LSM 880',
        model: 'Zeiss LSM 880',
        serialNumber: 'SN-880-2023-001',
        location: 'Imaging Facility, Room 204',
        description: 'Advanced confocal microscope with 405, 488, 561, 633nm lasers',
        maintenanceNotes: 'Last serviced: October 2024. Next service: April 2025',
        requiresTraining: true,
        bookingDuration: 120,
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'PCR Thermocycler',
        model: 'Bio-Rad C1000',
        serialNumber: 'SN-C1000-2022-045',
        location: 'Molecular Biology Lab, Bench 3',
        description: '96-well thermal cycler for PCR',
        maintenanceNotes: 'Cleaned weekly. Last calibration: September 2024',
        requiresTraining: false,
        bookingDuration: 180,
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Flow Cytometer',
        model: 'BD FACSAria III',
        serialNumber: 'SN-FACS-2021-089',
        location: 'Flow Cytometry Core, Room 310',
        description: 'Cell sorter with 4 lasers (355, 405, 488, 640nm)',
        maintenanceNotes: 'Serviced monthly. Operator assistance required.',
        requiresTraining: true,
        bookingDuration: 90,
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Plate Reader',
        model: 'BioTek Synergy H1',
        serialNumber: 'SN-H1-2023-112',
        location: 'Screening Lab, Room 215',
        description: 'Multi-mode microplate reader with absorbance, fluorescence, luminescence',
        maintenanceNotes: 'Calibrated quarterly. Next calibration: January 2025',
        requiresTraining: false,
        bookingDuration: 60,
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Ultracentrifuge',
        model: 'Beckman Optima XE-90',
        serialNumber: 'SN-XE90-2020-034',
        location: 'Protein Purification Lab, Room 108',
        description: 'Preparative ultracentrifuge, max speed 90,000 RPM',
        maintenanceNotes: 'Serviced annually. Last service: March 2024',
        requiresTraining: true,
        bookingDuration: 240,
      },
    }),
  ]);

  console.log(`Created ${equipment.length} equipment items`);

  // Create bookings
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        equipmentId: equipment[0].id,
        userId: users[2].id,
        startTime: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 11 AM today
        endTime: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 1 PM today
        purpose: 'Live cell imaging for CRISPR project',
        status: BookingStatus.SCHEDULED,
      },
    }),
    prisma.booking.create({
      data: {
        equipmentId: equipment[1].id,
        userId: users[3].id,
        startTime: new Date(today.getTime() + 1 * 60 * 60 * 1000), // 10 AM today
        endTime: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 1 PM today
        purpose: 'PCR amplification of gene constructs',
        status: BookingStatus.SCHEDULED,
      },
    }),
    prisma.booking.create({
      data: {
        equipmentId: equipment[3].id,
        userId: users[4].id,
        startTime: new Date(today.getTime() + 5 * 60 * 60 * 1000), // 2 PM today
        endTime: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 3 PM today
        purpose: 'Plate reading for cell viability assay',
        status: BookingStatus.SCHEDULED,
      },
    }),
    prisma.booking.create({
      data: {
        equipmentId: equipment[2].id,
        userId: users[1].id,
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 12 PM tomorrow
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 4.5 * 60 * 60 * 1000), // 1:30 PM tomorrow
        purpose: 'Cell sorting for RNA-seq',
        status: BookingStatus.SCHEDULED,
      },
    }),
  ]);

  console.log(`Created ${bookings.length} bookings`);

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-0001`,
        projectId: projects[0].id,
        status: OrderStatus.REQUESTED,
        itemName: 'Anti-Cas9 Antibody',
        vendor: 'Cell Signaling Technology',
        catalogNumber: '#14697',
        quantity: 1,
        unitPrice: 425.00,
        totalPrice: 425.00,
        justification: 'Needed for Western blot validation of CRISPR editing',
        createdById: users[2].id,
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-0002`,
        projectId: projects[0].id,
        status: OrderStatus.APPROVED,
        itemName: 'DMEM High Glucose Media',
        vendor: 'ThermoFisher',
        catalogNumber: '11965-092',
        quantity: 10,
        unitPrice: 32.50,
        totalPrice: 325.00,
        justification: 'Stock running low, needed for ongoing cell culture',
        createdById: users[2].id,
        approvedById: users[0].id,
        approvedDate: new Date('2024-11-03'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-0003`,
        projectId: projects[1].id,
        status: OrderStatus.ORDERED,
        itemName: 'Ni-NTA Agarose Beads',
        vendor: 'Qiagen',
        catalogNumber: '30210',
        quantity: 1,
        unitPrice: 380.00,
        totalPrice: 380.00,
        justification: 'For protein purification experiments',
        trackingNumber: 'UPS-1234567890',
        createdById: users[3].id,
        approvedById: users[1].id,
        approvedDate: new Date('2024-10-28'),
        orderedDate: new Date('2024-10-29'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-0004`,
        projectId: projects[2].id,
        status: OrderStatus.RECEIVED,
        itemName: 'Lipofectamine 3000',
        vendor: 'ThermoFisher',
        catalogNumber: 'L3000015',
        quantity: 2,
        unitPrice: 465.00,
        totalPrice: 930.00,
        justification: 'Transfection reagent for signaling studies',
        trackingNumber: 'FEDEX-9876543210',
        createdById: users[2].id,
        approvedById: users[0].id,
        approvedDate: new Date('2024-10-20'),
        orderedDate: new Date('2024-10-21'),
        receivedDate: new Date('2024-10-25'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-0005`,
        projectId: projects[1].id,
        status: OrderStatus.REQUESTED,
        itemName: 'IPTG (Isopropyl β-D-1-thiogalactopyranoside)',
        vendor: 'Sigma-Aldrich',
        catalogNumber: 'I6758',
        quantity: 5,
        unitPrice: 68.00,
        totalPrice: 340.00,
        justification: 'For protein expression induction',
        createdById: users[3].id,
      },
    }),
  ]);

  console.log(`Created ${orders.length} orders`);

  // Create alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        userId: users[0].id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: 'DMEM High Glucose Media is running low (250 mL remaining)',
        link: `/inventory/${reagents[0].id}`,
      },
    }),
    prisma.alert.create({
      data: {
        userId: users[0].id,
        type: 'ORDER_UPDATE',
        title: 'Order Pending Approval',
        message: 'Anti-Cas9 Antibody order requires your approval',
        link: `/orders/${orders[0].id}`,
      },
    }),
    prisma.alert.create({
      data: {
        userId: users[2].id,
        type: 'EQUIPMENT_REMINDER',
        title: 'Upcoming Equipment Booking',
        message: 'Confocal Microscope booking starts in 15 minutes',
        link: `/equipment/${equipment[0].id}`,
      },
    }),
    prisma.alert.create({
      data: {
        userId: users[1].id,
        type: 'ORDER_UPDATE',
        title: 'Order Approval Required',
        message: 'IPTG order needs approval',
        link: `/orders/${orders[4].id}`,
      },
    }),
  ]);

  console.log(`Created ${alerts.length} alerts`);

  console.log('Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('PI/Lab Manager: sarah.chen@biolab.edu / password123');
  console.log('Postdoc: michael.rodriguez@biolab.edu / password123');
  console.log('Grad Student: emily.zhang@biolab.edu / password123');
  console.log('Grad Student: james.wilson@biolab.edu / password123');
  console.log('Undergrad: alex.patel@biolab.edu / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
