/**
 * TraceNet — Seed Script
 * Generates realistic synthetic data for 4 mock cases with 40-50+ entities
 * and interconnected relationships for demo purposes.
 *
 * Run: npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

import User         from '../models/User.js';
import Case         from '../models/Case.js';
import Evidence     from '../models/Evidence.js';
import Entity       from '../models/Entity.js';
import Relationship from '../models/Relationship.js';
import AuditLog     from '../models/AuditLog.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tracenet';

// ─── Helpers ──────────────────────────────────────────────────────────
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Seed Data ────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  // Wipe existing data
  await Promise.all([
    User.deleteMany({}),
    Case.deleteMany({}),
    Evidence.deleteMany({}),
    Entity.deleteMany({}),
    Relationship.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ─── Users ────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const invHash   = await bcrypt.hash('Inv@12345', 12);
  const anaHash   = await bcrypt.hash('Ana@12345', 12);

  const [admin, inv1, inv2, analyst] = await User.insertMany([
    { name: 'Superintendent Arunav Bose',  email: 'admin@tracenet.in',      passwordHash: adminHash, role: 'admin',        badgeId: 'IPS-0001', department: 'CBI HQ' },
    { name: 'Inspector Priya Mehta',        email: 'priya@tracenet.in',      passwordHash: invHash,   role: 'investigator', badgeId: 'IPS-1042', department: 'STF Mumbai' },
    { name: 'DSP Rajan Nair',               email: 'rajan@tracenet.in',      passwordHash: invHash,   role: 'investigator', badgeId: 'IPS-0873', department: 'CID Kochi' },
    { name: 'Analyst Shreya Pillai',        email: 'shreya@tracenet.in',     passwordHash: anaHash,   role: 'analyst',      badgeId: 'ANL-2201', department: 'NATGRID' },
  ]);
  console.log('👤 Users seeded');

  // ─── Cases ────────────────────────────────────────────────────────
  const [caseA, caseB, caseC, caseD] = await Case.insertMany([
    {
      title: 'Operation Shadownet',
      description: 'Coordinated hawala network laundering funds through shell companies across Mumbai, Dubai and Singapore. 3 suspects identified.',
      status: 'active', priority: 'critical',
      assignedTo: inv1._id, createdBy: admin._id,
      jurisdiction: 'Mumbai, Maharashtra',
      tags: ['hawala', 'money-laundering', 'shell-companies'],
      caseNumber: 'TN-SHADOW01',
    },
    {
      title: 'Operation Redline',
      description: 'Suspected narcotics distribution ring with encrypted communication channels. Cellphone towers near Navi Mumbai show clustered activity.',
      status: 'active', priority: 'high',
      assignedTo: inv2._id, createdBy: admin._id,
      jurisdiction: 'Navi Mumbai, Maharashtra',
      tags: ['narcotics', 'encrypted-comms', 'CDR'],
      caseNumber: 'TN-RED002',
    },
    {
      title: 'Operation Ironhorse',
      description: 'Vehicle-theft syndicate linked to cross-border smuggling. Intercepted communication suggests involvement of a customs officer.',
      status: 'open', priority: 'medium',
      assignedTo: inv1._id, createdBy: inv1._id,
      jurisdiction: 'Rajasthan - Gujarat border',
      tags: ['vehicle-theft', 'smuggling', 'corruption'],
      caseNumber: 'TN-IRON003',
    },
    {
      title: 'Operation Cipher',
      description: 'Cyber fraud ring targeting banking customers through SIM-swap attacks. Linked financial accounts show suspicious movement.',
      status: 'active', priority: 'high',
      assignedTo: analyst._id, createdBy: admin._id,
      jurisdiction: 'Bengaluru, Karnataka',
      tags: ['cyber-fraud', 'SIM-swap', 'banking'],
      caseNumber: 'TN-CIPHER04',
    },
  ]);
  console.log('📁 Cases seeded');

  // ─── Evidence stubs (text stored inline for demo) ─────────────────
  const now = new Date();

  const shadowFIR = await Evidence.create({
    caseId: caseA._id, type: 'fir', uploadedBy: inv1._id,
    originalName: 'FIR_2024_MUM_4421.txt',
    sha256Hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    fileUrl: 'seed/fir_shadow.txt',
    processingStatus: 'done', extractedEntitiesCount: 6,
    rawText: `First Information Report No: 4421/2024
Registered at: Andheri Police Station, Mumbai
Date: 14-Mar-2024
Informant: Shri Mahesh Patil, Senior Manager, HDFC Bank, Andheri Branch

Report:
On 12-Mar-2024, our branch received a suspicious transaction of Rs. 85,00,000 from account number 919283746512 held in the name of Arjun Malhotra. The funds were immediately transferred in three tranches to Khalid Sheikh (account 773621948302) and a company named "FinPath Mercantile Pvt Ltd". 

Upon investigation by our compliance team, we found that Arjun Malhotra (mobile: 9876543210) is a known associate of Daud Ibrahim Shaikh, who is listed in our internal watchlist. The intermediary, Khalid Sheikh (mobile: 9123456780), appears to operate from an address in Bhendi Bazaar, Mumbai. 

A third suspect, Farida Begum, reportedly coordinates transactions from Dubai. Vehicle MH-02-AB-1234 was seen outside the branch at the time of the transaction.

The branch CCTV footage has been preserved. We urge immediate investigation.
Contact: Mahesh Patil, +91-9988776655`,
  });

  const shadowCDR = await Evidence.create({
    caseId: caseA._id, type: 'cdr', uploadedBy: inv1._id,
    originalName: 'CDR_ArjunMalhotra_Mar2024.csv',
    sha256Hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    fileUrl: 'seed/cdr_shadow.csv',
    processingStatus: 'done', extractedEntitiesCount: 8,
    rawText: `caller,callee,duration,timestamp,tower_id
9876543210,9123456780,420,2024-03-10T09:15:00Z,MUM-ANDHERI-07
9876543210,9123456780,310,2024-03-11T14:22:00Z,MUM-ANDHERI-07
9876543210,9988776655,120,2024-03-12T08:00:00Z,MUM-BKC-12
9123456780,9871234560,540,2024-03-12T10:30:00Z,MUM-BHENDI-03
9871234560,9876543210,90,2024-03-13T16:45:00Z,MUM-BHENDI-03
9123456780,9811223344,200,2024-03-14T11:00:00Z,MUM-BHENDI-03
9876543210,9811223344,350,2024-03-14T13:15:00Z,MUM-ANDHERI-07
9811223344,9871234560,180,2024-03-15T09:00:00Z,MUM-COLABA-01`,
  });

  const shadowFIN = await Evidence.create({
    caseId: caseA._id, type: 'financial', uploadedBy: admin._id,
    originalName: 'TXN_Shadownet_Q1.csv',
    sha256Hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    fileUrl: 'seed/fin_shadow.csv',
    processingStatus: 'done', extractedEntitiesCount: 5,
    rawText: `sender_account,receiver_account,amount,timestamp,description
919283746512,773621948302,2500000,2024-03-12T10:00:00Z,Trade settlement
919283746512,881234567890,3200000,2024-03-12T10:05:00Z,Commission payment
773621948302,992345678901,1800000,2024-03-13T14:00:00Z,Investment returns
881234567890,112345678902,900000,2024-03-14T09:00:00Z,Consulting fees
112345678902,773621948302,750000,2024-03-15T16:00:00Z,Refund
919283746512,334455667788,1200000,2024-03-16T11:00:00Z,Vendor payment`,
  });

  const redlineFIR = await Evidence.create({
    caseId: caseB._id, type: 'fir', uploadedBy: inv2._id,
    originalName: 'FIR_2024_NM_0876.txt',
    sha256Hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    fileUrl: 'seed/fir_redline.txt',
    processingStatus: 'done', extractedEntitiesCount: 5,
    rawText: `First Information Report No: 0876/2024
Registered at: Vashi Police Station, Navi Mumbai
Date: 02-Apr-2024

Report of narcotics seizure and network identification:

On 01-Apr-2024 at 2300 hrs, a vehicle GJ-01-XY-5678 was intercepted near Vashi toll plaza carrying 12 kg of methamphetamine. The driver, Vikram Yadav (mobile: 9765432109), confessed to receiving the consignment from Santosh Kamble at Dharavi warehouse. 

Interrogation revealed a three-tier network:
- Top-tier: Imran Khan (mobile: 9654321098), believed to be based in Pune
- Mid-tier: Santosh Kamble (mobile: 9543210987), Dharavi distributor  
- Street-level: Vikram Yadav and two unnamed associates

A Samsung phone seized from Vikram had encrypted messages on Signal to a contact saved as "Boss IK". The phone's IMEI is 356789012345678. Tower records show Vikram's phone pinging towers near Dharavi between 20:00 and 21:30 on 01-Apr.`,
  });

  const cipherFIR = await Evidence.create({
    caseId: caseD._id, type: 'fir', uploadedBy: analyst._id,
    originalName: 'FIR_2024_BLR_7721.txt',
    sha256Hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    fileUrl: 'seed/fir_cipher.txt',
    processingStatus: 'done', extractedEntitiesCount: 4,
    rawText: `First Information Report No: 7721/2024
Registered at: Koramangala Police Station, Bengaluru
Date: 18-May-2024

Complaint of cyber fraud via SIM-swap attack:

Complainant: Rohit Sharma, resident of Koramangala, Bengaluru (mobile: 9112233445).

On 17-May-2024, the complainant lost access to his mobile number after a SIM card was fraudulently issued to a third party. Subsequently, Rs. 12,40,000 was drained from his HDFC savings account (account: 445566778899) via multiple UPI transactions.

Preliminary technical investigation by our cyber cell identified that the SIM swap was executed by an insider at Airtel's authorized retailer "QuickSIM Solutions" at MG Road. The fraudster's number is 9001234567.

Transaction logs show funds moved through multiple accounts including 556677889900 and 667788990011, owned by shell entities "DigiWallet Services" and "PayEase Pvt Ltd".

Suspect IP addresses: 192.168.10.42 and 10.20.30.15 were found in bank server logs.`,
  });

  console.log('📎 Evidence stubs seeded');

  // ─── Entities — Operation Shadownet ──────────────────────────────
  const arjun    = await Entity.create({ name: 'Arjun Malhotra',          type: 'person',  caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowCDR._id], aliases: ['A. Malhotra'], influenceScore: 0.85, communityId: 0, flagged: true, flagReason: 'High-value account holder, 6 calls to known associates within 4 days' });
  const khalid   = await Entity.create({ name: 'Khalid Sheikh',           type: 'person',  caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowCDR._id], aliases: [],             influenceScore: 0.72, communityId: 0, flagged: true, flagReason: 'Received Rs. 25L in suspicious tranches; high call frequency' });
  const farida   = await Entity.create({ name: 'Farida Begum',            type: 'person',  caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id],                aliases: [],             influenceScore: 0.55, communityId: 0, flagged: false });
  const daud     = await Entity.create({ name: 'Daud Ibrahim Shaikh',     type: 'person',  caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id],                aliases: ['D.I. Shaikh'], influenceScore: 0.91, communityId: 0, flagged: true, flagReason: 'Listed in internal watchlist; named associate of Arjun Malhotra' });
  const mahesh   = await Entity.create({ name: 'Mahesh Patil',            type: 'person',  caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id],                aliases: [],             influenceScore: 0.20, communityId: 1 });
  const finpath  = await Entity.create({ name: 'FinPath Mercantile Pvt Ltd', type: 'organization', caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowFIN._id], aliases: ['FinPath'], influenceScore: 0.62, communityId: 0, flagged: true, flagReason: 'Shell company receiving layered transfers' });
  const ph1      = await Entity.create({ name: '9876543210',              type: 'phone',   caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowCDR._id], aliases: [],             influenceScore: 0.80, communityId: 0 });
  const ph2      = await Entity.create({ name: '9123456780',              type: 'phone',   caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowCDR._id], aliases: [],             influenceScore: 0.68, communityId: 0 });
  const ph3      = await Entity.create({ name: '9871234560',              type: 'phone',   caseIds: [caseA._id], sourceEvidenceIds: [shadowCDR._id],               aliases: [],             influenceScore: 0.45, communityId: 0 });
  const ph4      = await Entity.create({ name: '9811223344',              type: 'phone',   caseIds: [caseA._id], sourceEvidenceIds: [shadowCDR._id],               aliases: [],             influenceScore: 0.42, communityId: 1 });
  const acc1     = await Entity.create({ name: '919283746512',            type: 'account', caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowFIN._id], aliases: [],             influenceScore: 0.78, communityId: 0, flagged: true, flagReason: 'Source of Rs. 85L suspicious transfer' });
  const acc2     = await Entity.create({ name: '773621948302',            type: 'account', caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowFIN._id], aliases: [],             influenceScore: 0.60, communityId: 0 });
  const acc3     = await Entity.create({ name: '881234567890',            type: 'account', caseIds: [caseA._id], sourceEvidenceIds: [shadowFIN._id],               aliases: [],             influenceScore: 0.50, communityId: 0 });
  const veh1     = await Entity.create({ name: 'MH-02-AB-1234',          type: 'vehicle', caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id],               aliases: [],             influenceScore: 0.30, communityId: 0 });
  const loc1     = await Entity.create({ name: 'Bhendi Bazaar, Mumbai',  type: 'location',caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id],               aliases: [],             influenceScore: 0.25, communityId: 0 });
  const loc2     = await Entity.create({ name: 'Andheri, Mumbai',        type: 'location',caseIds: [caseA._id], sourceEvidenceIds: [shadowFIR._id, shadowCDR._id], aliases: [],            influenceScore: 0.22, communityId: 1 });

  // ─── Entities — Operation Redline ────────────────────────────────
  const vikram   = await Entity.create({ name: 'Vikram Yadav',           type: 'person',  caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.55, communityId: 2, flagged: true, flagReason: 'Arrested; confessed to narcotics transport' });
  const santosh  = await Entity.create({ name: 'Santosh Kamble',         type: 'person',  caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.70, communityId: 2, flagged: true, flagReason: 'Mid-tier distributor in narcotics network' });
  const imran    = await Entity.create({ name: 'Imran Khan',             type: 'person',  caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: ['Boss IK'], influenceScore: 0.88, communityId: 2, flagged: true, flagReason: 'Identified as top-tier operator; encrypted comms with arrested suspect' });
  const ph5      = await Entity.create({ name: '9765432109',             type: 'phone',   caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.50, communityId: 2 });
  const ph6      = await Entity.create({ name: '9654321098',             type: 'phone',   caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.75, communityId: 2 });
  const ph7      = await Entity.create({ name: '9543210987',             type: 'phone',   caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.65, communityId: 2 });
  const veh2     = await Entity.create({ name: 'GJ-01-XY-5678',         type: 'vehicle', caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.30, communityId: 2 });
  const loc3     = await Entity.create({ name: 'Dharavi, Mumbai',        type: 'location',caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.28, communityId: 2 });
  const loc4     = await Entity.create({ name: 'Vashi Toll Plaza',       type: 'location',caseIds: [caseB._id], sourceEvidenceIds: [redlineFIR._id], aliases: [], influenceScore: 0.15, communityId: 2 });

  // ─── Entities — Operation Cipher ─────────────────────────────────
  const rohit    = await Entity.create({ name: 'Rohit Sharma',           type: 'person',  caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.30, communityId: 3, flagged: false });
  const digiwallet= await Entity.create({ name: 'DigiWallet Services',   type: 'organization', caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.65, communityId: 3, flagged: true, flagReason: 'Shell entity receiving fraud proceeds' });
  const payease  = await Entity.create({ name: 'PayEase Pvt Ltd',        type: 'organization', caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.60, communityId: 3, flagged: true, flagReason: 'Shell entity receiving fraud proceeds' });
  const ph8      = await Entity.create({ name: '9112233445',             type: 'phone',   caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.25, communityId: 3 });
  const ph9      = await Entity.create({ name: '9001234567',             type: 'phone',   caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.70, communityId: 3, flagged: true, flagReason: 'Fraudster phone used in SIM-swap' });
  const acc4     = await Entity.create({ name: '445566778899',           type: 'account', caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.35, communityId: 3 });
  const acc5     = await Entity.create({ name: '556677889900',           type: 'account', caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.58, communityId: 3, flagged: true });
  const ip1      = await Entity.create({ name: '192.168.10.42',          type: 'ip',      caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.40, communityId: 3 });
  const ip2      = await Entity.create({ name: '10.20.30.15',            type: 'ip',      caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.35, communityId: 3 });
  const loc5     = await Entity.create({ name: 'Koramangala, Bengaluru', type: 'location',caseIds: [caseD._id], sourceEvidenceIds: [cipherFIR._id], aliases: [], influenceScore: 0.20, communityId: 3 });

  console.log('🧩 Entities seeded');

  // ─── Relationships — Shadownet ─────────────────────────────────────
  const shadowRels = [
    { src: arjun._id,   tgt: khalid._id,  type: 'associates_with', weight: 8, confidence: 0.90, evidences: [shadowFIR._id, shadowCDR._id] },
    { src: arjun._id,   tgt: daud._id,    type: 'associates_with', weight: 9, confidence: 0.85, evidences: [shadowFIR._id] },
    { src: khalid._id,  tgt: farida._id,  type: 'coordinates_with',weight: 6, confidence: 0.75, evidences: [shadowFIR._id] },
    { src: arjun._id,   tgt: finpath._id, type: 'owns',            weight: 7, confidence: 0.80, evidences: [shadowFIN._id] },
    { src: finpath._id, tgt: khalid._id,  type: 'transacted',      weight: 5, confidence: 0.88, evidences: [shadowFIN._id] },
    { src: ph1._id,     tgt: ph2._id,     type: 'called',          weight: 7, confidence: 0.95, evidences: [shadowCDR._id] },
    { src: ph1._id,     tgt: ph4._id,     type: 'called',          weight: 4, confidence: 0.92, evidences: [shadowCDR._id] },
    { src: ph2._id,     tgt: ph3._id,     type: 'called',          weight: 5, confidence: 0.93, evidences: [shadowCDR._id] },
    { src: ph3._id,     tgt: ph4._id,     type: 'called',          weight: 3, confidence: 0.90, evidences: [shadowCDR._id] },
    { src: acc1._id,    tgt: acc2._id,    type: 'transacted',      weight: 8, confidence: 0.95, evidences: [shadowFIN._id] },
    { src: acc1._id,    tgt: acc3._id,    type: 'transacted',      weight: 6, confidence: 0.92, evidences: [shadowFIN._id] },
    { src: acc2._id,    tgt: acc3._id,    type: 'transacted',      weight: 4, confidence: 0.88, evidences: [shadowFIN._id] },
    { src: arjun._id,   tgt: loc1._id,    type: 'located_at',      weight: 3, confidence: 0.70, evidences: [shadowFIR._id] },
    { src: khalid._id,  tgt: loc1._id,    type: 'located_at',      weight: 5, confidence: 0.80, evidences: [shadowFIR._id] },
    { src: veh1._id,    tgt: arjun._id,   type: 'owns',            weight: 4, confidence: 0.75, evidences: [shadowFIR._id] },
  ];

  // ─── Relationships — Redline ───────────────────────────────────────
  const redlineRels = [
    { src: imran._id,   tgt: santosh._id, type: 'coordinates_with',weight: 9, confidence: 0.85, evidences: [redlineFIR._id] },
    { src: santosh._id, tgt: vikram._id,  type: 'coordinates_with',weight: 7, confidence: 0.90, evidences: [redlineFIR._id] },
    { src: ph6._id,     tgt: ph7._id,     type: 'called',          weight: 6, confidence: 0.93, evidences: [redlineFIR._id] },
    { src: ph7._id,     tgt: ph5._id,     type: 'called',          weight: 5, confidence: 0.92, evidences: [redlineFIR._id] },
    { src: vikram._id,  tgt: veh2._id,    type: 'owns',            weight: 4, confidence: 0.95, evidences: [redlineFIR._id] },
    { src: vikram._id,  tgt: loc4._id,    type: 'located_at',      weight: 6, confidence: 0.90, evidences: [redlineFIR._id] },
    { src: santosh._id, tgt: loc3._id,    type: 'located_at',      weight: 7, confidence: 0.85, evidences: [redlineFIR._id] },
    { src: imran._id,   tgt: ph6._id,     type: 'owns',            weight: 8, confidence: 0.80, evidences: [redlineFIR._id] },
  ];

  // ─── Relationships — Cipher ────────────────────────────────────────
  const cipherRels = [
    { src: ph9._id,     tgt: rohit._id,   type: 'suspected_of',    weight: 7, confidence: 0.85, evidences: [cipherFIR._id] },
    { src: ph9._id,     tgt: acc5._id,    type: 'transacted',      weight: 6, confidence: 0.90, evidences: [cipherFIR._id] },
    { src: acc4._id,    tgt: acc5._id,    type: 'transacted',      weight: 5, confidence: 0.92, evidences: [cipherFIR._id] },
    { src: acc5._id,    tgt: digiwallet._id, type: 'transacted',   weight: 7, confidence: 0.88, evidences: [cipherFIR._id] },
    { src: acc5._id,    tgt: payease._id, type: 'transacted',      weight: 6, confidence: 0.85, evidences: [cipherFIR._id] },
    { src: ip1._id,     tgt: acc5._id,    type: 'other',           weight: 4, confidence: 0.80, evidences: [cipherFIR._id] },
    { src: ip2._id,     tgt: acc5._id,    type: 'other',           weight: 3, confidence: 0.75, evidences: [cipherFIR._id] },
    { src: digiwallet._id, tgt: payease._id, type: 'associates_with', weight: 8, confidence: 0.82, evidences: [cipherFIR._id] },
  ];

  const allRels = [
    ...shadowRels.map(r => ({ ...r, caseId: caseA._id })),
    ...redlineRels.map(r => ({ ...r, caseId: caseB._id })),
    ...cipherRels.map(r => ({ ...r, caseId: caseD._id })),
  ];

  await Relationship.insertMany(allRels.map(r => ({
    sourceEntityId:    r.src,
    targetEntityId:    r.tgt,
    type:              r.type,
    weight:            r.weight,
    confidence:        r.confidence,
    sourceEvidenceIds: r.evidences,
    caseId:            r.caseId,
  })));

  console.log('🔗 Relationships seeded');

  // ─── Audit log samples ─────────────────────────────────────────────
  await AuditLog.insertMany([
    { userId: admin._id, userEmail: admin.email, action: 'USER_LOGIN',   targetId: admin._id.toString(), targetType: 'User', timestamp: new Date(Date.now() - 3600000) },
    { userId: inv1._id,  userEmail: inv1.email,  action: 'USER_LOGIN',   targetId: inv1._id.toString(),  targetType: 'User', timestamp: new Date(Date.now() - 1800000) },
    { userId: inv1._id,  userEmail: inv1.email,  action: 'CASE_VIEWED',  targetId: caseA._id.toString(), targetType: 'Case', timestamp: new Date(Date.now() - 1700000) },
    { userId: inv1._id,  userEmail: inv1.email,  action: 'EVIDENCE_UPLOADED', targetId: shadowFIR._id.toString(), targetType: 'Evidence', timestamp: new Date(Date.now() - 1600000) },
    { userId: inv2._id,  userEmail: inv2.email,  action: 'USER_LOGIN',   targetId: inv2._id.toString(),  targetType: 'User', timestamp: new Date(Date.now() - 900000) },
    { userId: inv2._id,  userEmail: inv2.email,  action: 'GRAPH_VIEWED', targetId: caseB._id.toString(), targetType: 'Case', timestamp: new Date(Date.now() - 800000) },
    { userId: analyst._id, userEmail: analyst.email, action: 'ENTITIES_LISTED', targetId: null, targetType: 'Entity', timestamp: new Date(Date.now() - 300000) },
  ]);

  console.log('📋 Audit logs seeded');
  console.log('\n✅ Seed complete!');
  console.log('\n─── Demo Credentials ────────────────────────────────────');
  console.log('  Admin:       admin@tracenet.in     / Admin@1234');
  console.log('  Investigator: priya@tracenet.in    / Inv@12345');
  console.log('  Investigator: rajan@tracenet.in    / Inv@12345');
  console.log('  Analyst:     shreya@tracenet.in    / Ana@12345');
  console.log('─────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
