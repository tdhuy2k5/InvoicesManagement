-- AlterTable: Add Decree 123 fields, buyer/seller contact details, and Zero-Gap sequence support
ALTER TABLE "Invoice" 
    ADD COLUMN "templateCode" TEXT NOT NULL DEFAULT '01GTKT3/001',
    ADD COLUMN "customerPhone" TEXT,
    ADD COLUMN "customerBankAccount" TEXT,
    ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'TM/CK',
    ADD COLUMN "sellerEmail" TEXT,
    ADD COLUMN "sellerBankAccount" TEXT,
    ADD COLUMN "taxDepartment" TEXT,
    ADD COLUMN "taxAuthorityCode" TEXT,
    ADD COLUMN "agreementMinutes" TEXT,
    ALTER COLUMN "zone" SET DEFAULT '1C26TAA',
    ALTER COLUMN "sequenceNumber" DROP DEFAULT,
    ALTER COLUMN "sequenceNumber" DROP NOT NULL;
