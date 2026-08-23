// ==============================================================================
// BACKEND LOGIC GRAPH: InvoiceManagement
// Generated incrementally via /generate-backend-graph
// ==============================================================================

// ==============================================================================
// DOMAIN: invoiceManagement
// ==============================================================================
MERGE (d:Domain { id: "invoiceManagement", name: "Invoice Management" })

// ==============================================================================
// WORKFLOW: createDraftInvoice
// ==============================================================================
MERGE (wf_createDraft:Workflow {
  id: "createDraftInvoice",
  name: "Create Draft Invoice",
  description: "Validate input, compute line item amounts, generate sequence invoice number HD-YYYY-NNNNN, and persist invoice in DRAFT status"
})
MERGE (d)-[:CONTAINS]->(wf_createDraft)

// Workflow Steps
MERGE (ws_create_1:WorkflowStep { id: "createDraftInvoice_step_1", name: "Validate Request DTO", order: 1 })
MERGE (ws_create_2:WorkflowStep { id: "createDraftInvoice_step_2", name: "Calculate Line Items & Totals", order: 2 })
MERGE (ws_create_3:WorkflowStep { id: "createDraftInvoice_step_3", name: "Generate Invoice Number Sequence", order: 3 })
MERGE (ws_create_4:WorkflowStep { id: "createDraftInvoice_step_4", name: "Persist Draft Invoice", order: 4 })

MERGE (wf_createDraft)-[:HAS_STEP]->(ws_create_1)
MERGE (wf_createDraft)-[:HAS_STEP]->(ws_create_2)
MERGE (wf_createDraft)-[:HAS_STEP]->(ws_create_3)
MERGE (wf_createDraft)-[:HAS_STEP]->(ws_create_4)

MERGE (ws_create_1)-[:NEXT_STEP]->(ws_create_2)
MERGE (ws_create_2)-[:NEXT_STEP]->(ws_create_3)
MERGE (ws_create_3)-[:NEXT_STEP]->(ws_create_4)

// Services
MERGE (s_invoiceService:Service { id: "InvoiceService", description: "Handles core invoice business logic and lifecycle operations" })
MERGE (s_calcService:Service { id: "InvoiceCalculationService", description: "Calculates line item amounts, subtotal, VAT amount, and total amounts" })
MERGE (s_seqService:Service { id: "InvoiceSequenceService", description: "Manages sequential invoice number generation via PostgreSQL sequence" })
MERGE (s_invoiceRepo:Service { id: "InvoiceRepository", description: "Handles database persistence for invoice and line item records" })

// Functions
MERGE (fn_createDraftInvoice:Function {
  id: "createDraftInvoice",
  type: "MUTATION",
  input: "dto: CreateInvoiceDTO",
  output: "InvoiceResponseDTO",
  desc: "Orchestrates draft invoice validation, calculation, sequencing, and creation",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_calcTotals:Function {
  id: "calculateInvoiceTotals",
  type: "UTILITY",
  input: "items: CreateInvoiceItemDTO[], vatRate: number",
  output: "CalculatedTotals",
  desc: "Calculates line totals and VAT amounts with strict rounding",
  roles: "PUBLIC",
  guard: ""
})

MERGE (fn_genInvoiceNum:Function {
  id: "generateInvoiceNumber",
  type: "MUTATION",
  input: "",
  output: "string",
  desc: "Fetches nextval from invoice_number_seq and formats as HD-YYYY-00001",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_createInvoiceRepo:Function {
  id: "createInvoice",
  type: "MUTATION",
  input: "data: CreateInvoiceModelInput",
  output: "Invoice",
  desc: "Persists invoice and nested line items to PostgreSQL via Prisma",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_createDraftInvoice)
MERGE (s_calcService)-[:OWNS]->(fn_calcTotals)
MERGE (s_seqService)-[:OWNS]->(fn_genInvoiceNum)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_createInvoiceRepo)

// Workflow Step Execution
MERGE (ws_create_1)-[:EXECUTES]->(fn_createDraftInvoice)
MERGE (ws_create_2)-[:EXECUTES]->(fn_calcTotals)
MERGE (ws_create_3)-[:EXECUTES]->(fn_genInvoiceNum)
MERGE (ws_create_4)-[:EXECUTES]->(fn_createInvoiceRepo)

// Dependencies
MERGE (fn_createDraftInvoice)-[:DEPENDS_ON]->(fn_calcTotals)
MERGE (fn_createDraftInvoice)-[:DEPENDS_ON]->(fn_genInvoiceNum)
MERGE (fn_createDraftInvoice)-[:DEPENDS_ON]->(fn_createInvoiceRepo)

// ==============================================================================
// WORKFLOW: getInvoices
// ==============================================================================
MERGE (wf_getInvoices:Workflow {
  id: "getInvoices",
  name: "Read Invoices",
  description: "Fetch paginated invoice lists with status/date filters and retrieve detailed single invoice records with all line items"
})
MERGE (d)-[:CONTAINS]->(wf_getInvoices)

// Workflow Steps
MERGE (ws_get_1:WorkflowStep { id: "getInvoices_step_1", name: "Validate Query Parameters", order: 1 })
MERGE (ws_get_2:WorkflowStep { id: "getInvoices_step_2", name: "Query Paginated Invoices List", order: 2 })
MERGE (ws_get_3:WorkflowStep { id: "getInvoices_step_3", name: "Fetch Single Invoice Detail", order: 3 })

MERGE (wf_getInvoices)-[:HAS_STEP]->(ws_get_1)
MERGE (wf_getInvoices)-[:HAS_STEP]->(ws_get_2)
MERGE (wf_getInvoices)-[:HAS_STEP]->(ws_get_3)

MERGE (ws_get_1)-[:NEXT_STEP]->(ws_get_2)

// Functions
MERGE (fn_getInvoicesList:Function {
  id: "getInvoicesList",
  type: "QUERY",
  input: "query: GetInvoicesQueryDTO",
  output: "PaginatedInvoicesResponseDTO",
  desc: "Processes query filters, delegates to repository, and structures paginated response envelope",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_getInvoiceById:Function {
  id: "getInvoiceById",
  type: "QUERY",
  input: "id: string",
  output: "InvoiceResponseDTO",
  desc: "Retrieves a single invoice by ID, ensuring existence or throwing INVOICE_NOT_FOUND",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_findManyRepo:Function {
  id: "findManyInvoices",
  type: "QUERY",
  input: "filter: FindManyInvoicesInput",
  output: "{ items: Invoice[], total: number }",
  desc: "Executes paginated Prisma query with filters and sorting against PostgreSQL",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_findByIdRepo:Function {
  id: "findInvoiceById",
  type: "QUERY",
  input: "id: string",
  output: "Invoice | null",
  desc: "Executes Prisma findUnique query with items included",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_getInvoicesList)
MERGE (s_invoiceService)-[:OWNS]->(fn_getInvoiceById)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_findManyRepo)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_findByIdRepo)

// Workflow Step Execution
MERGE (ws_get_1)-[:EXECUTES]->(fn_getInvoicesList)
MERGE (ws_get_2)-[:EXECUTES]->(fn_findManyRepo)
MERGE (ws_get_3)-[:EXECUTES]->(fn_getInvoiceById)
MERGE (ws_get_3)-[:EXECUTES]->(fn_findByIdRepo)

// Dependencies
MERGE (fn_getInvoicesList)-[:DEPENDS_ON]->(fn_findManyRepo)
MERGE (fn_getInvoiceById)-[:DEPENDS_ON]->(fn_findByIdRepo)

// ==============================================================================
// WORKFLOW: updateDraftInvoice
// ==============================================================================
MERGE (wf_updateDraft:Workflow {
  id: "updateDraftInvoice",
  name: "Update Draft Invoice",
  description: "Verify draft status, replace invoice line items in database transaction, and recalculate summary totals"
})
MERGE (d)-[:CONTAINS]->(wf_updateDraft)

// Workflow Steps
MERGE (ws_upd_1:WorkflowStep { id: "updateDraftInvoice_step_1", name: "Validate Status & Input DTO", order: 1 })
MERGE (ws_upd_2:WorkflowStep { id: "updateDraftInvoice_step_2", name: "Recalculate Line Items & Totals", order: 2 })
MERGE (ws_upd_3:WorkflowStep { id: "updateDraftInvoice_step_3", name: "Execute Atomic Item Replacement", order: 3 })

MERGE (wf_updateDraft)-[:HAS_STEP]->(ws_upd_1)
MERGE (wf_updateDraft)-[:HAS_STEP]->(ws_upd_2)
MERGE (wf_updateDraft)-[:HAS_STEP]->(ws_upd_3)

MERGE (ws_upd_1)-[:NEXT_STEP]->(ws_upd_2)
MERGE (ws_upd_2)-[:NEXT_STEP]->(ws_upd_3)

// Services (New / Shared)
MERGE (s_guardService:Service { id: "StateMachineGuard", description: "Enforces legal invoice lifecycle transitions and state mutation guards" })

// Functions
MERGE (fn_validateDraftMod:Function {
  id: "validateDraftModification",
  type: "UTILITY",
  input: "currentStatus: InvoiceStatus",
  output: "void",
  desc: "Ensures status is DRAFT before allowing edit/delete or throws INVALID_TRANSITION",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_updateDraftInvoice:Function {
  id: "updateDraftInvoice",
  type: "MUTATION",
  input: "id: string, dto: UpdateInvoiceDTO",
  output: "InvoiceResponseDTO",
  desc: "Orchestrates draft invoice update with line item replacement and recalculation",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_replaceDraftItemsAndUpdate:Function {
  id: "replaceDraftItemsAndUpdate",
  type: "MUTATION",
  input: "id: string, data: UpdateDraftInvoiceModelInput",
  output: "Invoice",
  desc: "Replaces line items in a database transaction and updates invoice headers",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_guardService)-[:OWNS]->(fn_validateDraftMod)
MERGE (s_invoiceService)-[:OWNS]->(fn_updateDraftInvoice)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_replaceDraftItemsAndUpdate)

// Workflow Step Execution
MERGE (ws_upd_1)-[:EXECUTES]->(fn_updateDraftInvoice)
MERGE (ws_upd_1)-[:EXECUTES]->(fn_validateDraftMod)
MERGE (ws_upd_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_upd_2)-[:EXECUTES]->(fn_calcTotals)
MERGE (ws_upd_3)-[:EXECUTES]->(fn_replaceDraftItemsAndUpdate)

// Dependencies
MERGE (fn_updateDraftInvoice)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_updateDraftInvoice)-[:DEPENDS_ON]->(fn_validateDraftMod)
MERGE (fn_updateDraftInvoice)-[:DEPENDS_ON]->(fn_calcTotals)
MERGE (fn_updateDraftInvoice)-[:DEPENDS_ON]->(fn_replaceDraftItemsAndUpdate)

// ==============================================================================
// WORKFLOW: deleteDraftInvoice
// ==============================================================================
MERGE (wf_deleteDraft:Workflow {
  id: "deleteDraftInvoice",
  name: "Physical Delete Draft Invoice",
  description: "Verify invoice existence, guard against non-DRAFT deletion, and physically delete invoice and associated items from PostgreSQL"
})
MERGE (d)-[:CONTAINS]->(wf_deleteDraft)

// Workflow Steps
MERGE (ws_del_1:WorkflowStep { id: "deleteDraftInvoice_step_1", name: "Check Existence and Draft Status", order: 1 })
MERGE (ws_del_2:WorkflowStep { id: "deleteDraftInvoice_step_2", name: "Physically Delete Invoice", order: 2 })

MERGE (wf_deleteDraft)-[:HAS_STEP]->(ws_del_1)
MERGE (wf_deleteDraft)-[:HAS_STEP]->(ws_del_2)

MERGE (ws_del_1)-[:NEXT_STEP]->(ws_del_2)

// Functions
MERGE (fn_deleteDraftInvoice:Function {
  id: "deleteDraftInvoice",
  type: "MUTATION",
  input: "id: string",
  output: "DeleteResponseDTO",
  desc: "Coordinates existence check, draft status verification, and physical deletion",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_deleteInvoiceRepo:Function {
  id: "deleteInvoice",
  type: "MUTATION",
  input: "id: string",
  output: "Invoice",
  desc: "Physically deletes invoice record and cascaded line items from database via Prisma",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_deleteDraftInvoice)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_deleteInvoiceRepo)

// Workflow Step Execution
MERGE (ws_del_1)-[:EXECUTES]->(fn_deleteDraftInvoice)
MERGE (ws_del_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_del_1)-[:EXECUTES]->(fn_validateDraftMod)
MERGE (ws_del_2)-[:EXECUTES]->(fn_deleteInvoiceRepo)

// Dependencies
MERGE (fn_deleteDraftInvoice)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_deleteDraftInvoice)-[:DEPENDS_ON]->(fn_validateDraftMod)
MERGE (fn_deleteDraftInvoice)-[:DEPENDS_ON]->(fn_deleteInvoiceRepo)

// ==============================================================================
// WORKFLOW: cloneInvoice
// ==============================================================================
MERGE (wf_cloneInvoice:Workflow {
  id: "cloneInvoice",
  name: "Clone Draft Invoice",
  description: "Duplicate seller info, customer info, and line items from any source invoice into a fresh DRAFT invoice with a new sequential number"
})
MERGE (d)-[:CONTAINS]->(wf_cloneInvoice)

// Workflow Steps
MERGE (ws_clone_1:WorkflowStep { id: "cloneInvoice_step_1", name: "Fetch Source Invoice Details", order: 1 })
MERGE (ws_clone_2:WorkflowStep { id: "cloneInvoice_step_2", name: "Generate Sequence & Recalculate Totals", order: 2 })
MERGE (ws_clone_3:WorkflowStep { id: "cloneInvoice_step_3", name: "Persist Cloned Draft Invoice", order: 3 })

MERGE (wf_cloneInvoice)-[:HAS_STEP]->(ws_clone_1)
MERGE (wf_cloneInvoice)-[:HAS_STEP]->(ws_clone_2)
MERGE (wf_cloneInvoice)-[:HAS_STEP]->(ws_clone_3)

MERGE (ws_clone_1)-[:NEXT_STEP]->(ws_clone_2)
MERGE (ws_clone_2)-[:NEXT_STEP]->(ws_clone_3)

// Functions
MERGE (fn_cloneInvoice:Function {
  id: "cloneInvoice",
  type: "MUTATION",
  input: "id: string",
  output: "InvoiceResponseDTO",
  desc: "Clones customer and items from existing invoice into a new DRAFT invoice with new sequence number",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_cloneInvoice)

// Workflow Step Execution
MERGE (ws_clone_1)-[:EXECUTES]->(fn_cloneInvoice)
MERGE (ws_clone_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_clone_2)-[:EXECUTES]->(fn_genInvoiceNum)
MERGE (ws_clone_2)-[:EXECUTES]->(fn_calcTotals)
MERGE (ws_clone_3)-[:EXECUTES]->(fn_createInvoiceRepo)

// Dependencies
MERGE (fn_cloneInvoice)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_cloneInvoice)-[:DEPENDS_ON]->(fn_genInvoiceNum)
MERGE (fn_cloneInvoice)-[:DEPENDS_ON]->(fn_calcTotals)
MERGE (fn_cloneInvoice)-[:DEPENDS_ON]->(fn_createInvoiceRepo)

// ==============================================================================
// WORKFLOW: issueInvoice
// ==============================================================================
MERGE (wf_issueInvoice:Workflow {
  id: "issueInvoice",
  name: "Issue Invoice",
  description: "Validate DRAFT status and data completeness, transition status to ISSUED with issueDate, invalidate/warm PDF cache, and lock invoice against edits"
})
MERGE (d)-[:CONTAINS]->(wf_issueInvoice)

// Workflow Steps
MERGE (ws_issue_1:WorkflowStep { id: "issueInvoice_step_1", name: "Verify Status & Data Completeness", order: 1 })
MERGE (ws_issue_2:WorkflowStep { id: "issueInvoice_step_2", name: "Transition Status to ISSUED", order: 2 })
MERGE (ws_issue_3:WorkflowStep { id: "issueInvoice_step_3", name: "Invalidate or Warm PDF Cache", order: 3 })

MERGE (wf_issueInvoice)-[:HAS_STEP]->(ws_issue_1)
MERGE (wf_issueInvoice)-[:HAS_STEP]->(ws_issue_2)
MERGE (wf_issueInvoice)-[:HAS_STEP]->(ws_issue_3)

MERGE (ws_issue_1)-[:NEXT_STEP]->(ws_issue_2)
MERGE (ws_issue_2)-[:NEXT_STEP]->(ws_issue_3)

// Services (Referenced / New)
MERGE (s_pdfService:Service { id: "PdfService", description: "Generates Vietnamese A4 PDF invoices using Puppeteer with font embedding and disk caching" })

// Functions
MERGE (fn_issueInvoice:Function {
  id: "issueInvoice",
  type: "MUTATION",
  input: "id: string",
  output: "InvoiceResponseDTO",
  desc: "Orchestrates invoice issue transition, sets issueDate = now(), and manages PDF cache",
  roles: "AUTHENTICATED",
  guard: "status == DRAFT"
})

MERGE (fn_validateIssueTransition:Function {
  id: "validateIssueTransition",
  type: "UTILITY",
  input: "currentStatus: InvoiceStatus",
  output: "void",
  desc: "Ensures status is DRAFT before allowing transition to ISSUED or throws INVALID_TRANSITION",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_updateInvoiceStatusRepo:Function {
  id: "updateInvoiceStatus",
  type: "MUTATION",
  input: "id: string, status: InvoiceStatus, issueDate?: Date, cancelReason?: string, replacedById?: string",
  output: "Invoice",
  desc: "Updates invoice status, timestamps, and transition metadata in PostgreSQL",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_invalidatePdfCache:Function {
  id: "invalidatePdfCache",
  type: "MUTATION",
  input: "invoiceNumber: string",
  output: "void",
  desc: "Deletes cached PDF file from disk storage when invoice state mutates",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_issueInvoice)
MERGE (s_guardService)-[:OWNS]->(fn_validateIssueTransition)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_updateInvoiceStatusRepo)
MERGE (s_pdfService)-[:OWNS]->(fn_invalidatePdfCache)

// Workflow Step Execution
MERGE (ws_issue_1)-[:EXECUTES]->(fn_issueInvoice)
MERGE (ws_issue_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_issue_1)-[:EXECUTES]->(fn_validateIssueTransition)
MERGE (ws_issue_2)-[:EXECUTES]->(fn_updateInvoiceStatusRepo)
MERGE (ws_issue_3)-[:EXECUTES]->(fn_invalidatePdfCache)

// Dependencies
MERGE (fn_issueInvoice)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_issueInvoice)-[:DEPENDS_ON]->(fn_validateIssueTransition)
MERGE (fn_issueInvoice)-[:DEPENDS_ON]->(fn_updateInvoiceStatusRepo)
MERGE (fn_issueInvoice)-[:DEPENDS_ON]->(fn_invalidatePdfCache)

// ==============================================================================
// WORKFLOW: cancelInvoice
// ==============================================================================
MERGE (wf_cancelInvoice:Workflow {
  id: "cancelInvoice",
  name: "Cancel Issued Invoice",
  description: "Verify invoice is in ISSUED status, record cancellation reason audit metadata, transition status to CANCELED, and invalidate PDF cache"
})
MERGE (d)-[:CONTAINS]->(wf_cancelInvoice)

// Workflow Steps
MERGE (ws_cancel_1:WorkflowStep { id: "cancelInvoice_step_1", name: "Verify ISSUED Status", order: 1 })
MERGE (ws_cancel_2:WorkflowStep { id: "cancelInvoice_step_2", name: "Persist CANCELED Status & Reason", order: 2 })
MERGE (ws_cancel_3:WorkflowStep { id: "cancelInvoice_step_3", name: "Invalidate PDF Cache", order: 3 })

MERGE (wf_cancelInvoice)-[:HAS_STEP]->(ws_cancel_1)
MERGE (wf_cancelInvoice)-[:HAS_STEP]->(ws_cancel_2)
MERGE (wf_cancelInvoice)-[:HAS_STEP]->(ws_cancel_3)

MERGE (ws_cancel_1)-[:NEXT_STEP]->(ws_cancel_2)
MERGE (ws_cancel_2)-[:NEXT_STEP]->(ws_cancel_3)

// Functions
MERGE (fn_cancelInvoice:Function {
  id: "cancelInvoice",
  type: "MUTATION",
  input: "id: string, dto: CancelInvoiceDTO",
  output: "InvoiceResponseDTO",
  desc: "Orchestrates transition of ISSUED invoice to CANCELED with audit reason",
  roles: "AUTHENTICATED",
  guard: "status == ISSUED"
})

MERGE (fn_validateCancelTransition:Function {
  id: "validateCancelTransition",
  type: "UTILITY",
  input: "currentStatus: InvoiceStatus",
  output: "void",
  desc: "Ensures status is ISSUED before allowing transition to CANCELED or throws INVALID_TRANSITION",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_cancelInvoice)
MERGE (s_guardService)-[:OWNS]->(fn_validateCancelTransition)

// Workflow Step Execution
MERGE (ws_cancel_1)-[:EXECUTES]->(fn_cancelInvoice)
MERGE (ws_cancel_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_cancel_1)-[:EXECUTES]->(fn_validateCancelTransition)
MERGE (ws_cancel_2)-[:EXECUTES]->(fn_updateInvoiceStatusRepo)
MERGE (ws_cancel_3)-[:EXECUTES]->(fn_invalidatePdfCache)

// Dependencies
MERGE (fn_cancelInvoice)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_cancelInvoice)-[:DEPENDS_ON]->(fn_validateCancelTransition)
MERGE (fn_cancelInvoice)-[:DEPENDS_ON]->(fn_updateInvoiceStatusRepo)
MERGE (fn_cancelInvoice)-[:DEPENDS_ON]->(fn_invalidatePdfCache)

// ==============================================================================
// WORKFLOW: replaceInvoice
// ==============================================================================
MERGE (wf_replaceInvoice:Workflow {
  id: "replaceInvoice",
  name: "Atomic Invoice Replacement",
  description: "Validate 1-level replacement depth guard on root ISSUED invoice, calculate replacement totals, generate sequence, and atomically mark original as REPLACED while creating new ISSUED invoice in a single database transaction"
})
MERGE (d)-[:CONTAINS]->(wf_replaceInvoice)

// Workflow Steps
MERGE (ws_replace_1:WorkflowStep { id: "replaceInvoice_step_1", name: "Validate Root ISSUED Status & Depth Guard", order: 1 })
MERGE (ws_replace_2:WorkflowStep { id: "replaceInvoice_step_2", name: "Calculate Replacement Items & Generate Sequence", order: 2 })
MERGE (ws_replace_3:WorkflowStep { id: "replaceInvoice_step_3", name: "Execute Atomic Replacement Transaction", order: 3 })

MERGE (wf_replaceInvoice)-[:HAS_STEP]->(ws_replace_1)
MERGE (wf_replaceInvoice)-[:HAS_STEP]->(ws_replace_2)
MERGE (wf_replaceInvoice)-[:HAS_STEP]->(ws_replace_3)

MERGE (ws_replace_1)-[:NEXT_STEP]->(ws_replace_2)
MERGE (ws_replace_2)-[:NEXT_STEP]->(ws_replace_3)

// Functions
MERGE (fn_replaceInvoice:Function {
  id: "replaceInvoice",
  type: "MUTATION",
  input: "id: string, dto: ReplaceInvoiceDTO",
  output: "InvoiceResponseDTO",
  desc: "Orchestrates atomic replacement of root ISSUED invoice with new replacement invoice",
  roles: "AUTHENTICATED",
  guard: "status == ISSUED && originalInvoiceId == null"
})

MERGE (fn_validateReplacementEligibility:Function {
  id: "validateReplacementEligibility",
  type: "UTILITY",
  input: "currentStatus: InvoiceStatus, originalInvoiceId: string | null",
  output: "void",
  desc: "Guards that status is ISSUED and invoice is root (originalInvoiceId is null), otherwise throws INVALID_TRANSITION or REPLACEMENT_NOT_ALLOWED",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_executeReplacementTxRepo:Function {
  id: "executeReplacementTransaction",
  type: "MUTATION",
  input: "originalId: string, newInvoiceData: CreateInvoiceModelInput",
  output: "{ original: Invoice, replacement: Invoice }",
  desc: "Executes atomic prisma.$transaction updating original to REPLACED and inserting replacement with originalInvoiceId",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_replaceInvoice)
MERGE (s_guardService)-[:OWNS]->(fn_validateReplacementEligibility)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_executeReplacementTxRepo)

// Workflow Step Execution
MERGE (ws_replace_1)-[:EXECUTES]->(fn_replaceInvoice)
MERGE (ws_replace_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_replace_1)-[:EXECUTES]->(fn_validateReplacementEligibility)
MERGE (ws_replace_2)-[:EXECUTES]->(fn_calcTotals)
MERGE (ws_replace_2)-[:EXECUTES]->(fn_genInvoiceNum)
MERGE (ws_replace_3)-[:EXECUTES]->(fn_executeReplacementTxRepo)
MERGE (ws_replace_3)-[:EXECUTES]->(fn_invalidatePdfCache)

// Dependencies
MERGE (fn_replaceInvoice)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_replaceInvoice)-[:DEPENDS_ON]->(fn_validateReplacementEligibility)
MERGE (fn_replaceInvoice)-[:DEPENDS_ON]->(fn_calcTotals)
MERGE (fn_replaceInvoice)-[:DEPENDS_ON]->(fn_genInvoiceNum)
MERGE (fn_replaceInvoice)-[:DEPENDS_ON]->(fn_executeReplacementTxRepo)
MERGE (fn_replaceInvoice)-[:DEPENDS_ON]->(fn_invalidatePdfCache)

// ==============================================================================
// WORKFLOW: searchInvoices
// ==============================================================================
MERGE (wf_searchInvoices:Workflow {
  id: "searchInvoices",
  name: "Indexed Search & Filtering",
  description: "Perform case-insensitive multi-field search (invoice number, customer name, tax code, email) and composite filtering by status and date range optimized with PostgreSQL indexes"
})
MERGE (d)-[:CONTAINS]->(wf_searchInvoices)

// Workflow Steps
MERGE (ws_search_1:WorkflowStep { id: "searchInvoices_step_1", name: "Parse & Sanitize Search Filters", order: 1 })
MERGE (ws_search_2:WorkflowStep { id: "searchInvoices_step_2", name: "Execute Indexed Query & Aggregation", order: 2 })

MERGE (wf_searchInvoices)-[:HAS_STEP]->(ws_search_1)
MERGE (wf_searchInvoices)-[:HAS_STEP]->(ws_search_2)

MERGE (ws_search_1)-[:NEXT_STEP]->(ws_search_2)

// Functions
MERGE (fn_searchInvoices:Function {
  id: "searchInvoices",
  type: "QUERY",
  input: "query: SearchInvoicesQueryDTO",
  output: "PaginatedInvoicesResponseDTO",
  desc: "Processes search terms and filter criteria, delegating to optimized repository query",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_searchInvoicesRepo:Function {
  id: "searchInvoicesRepo",
  type: "QUERY",
  input: "criteria: InvoiceSearchCriteriaInput",
  output: "{ items: Invoice[], total: number }",
  desc: "Executes Prisma multi-field case-insensitive query matching composite indexes on status, createdAt, and invoiceNumber",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_invoiceService)-[:OWNS]->(fn_searchInvoices)
MERGE (s_invoiceRepo)-[:OWNS]->(fn_searchInvoicesRepo)

// Workflow Step Execution
MERGE (ws_search_1)-[:EXECUTES]->(fn_searchInvoices)
MERGE (ws_search_2)-[:EXECUTES]->(fn_searchInvoicesRepo)

// Dependencies
MERGE (fn_searchInvoices)-[:DEPENDS_ON]->(fn_searchInvoicesRepo)

// ==============================================================================
// WORKFLOW: streamInvoicePdf
// ==============================================================================
MERGE (wf_streamInvoicePdf:Workflow {
  id: "streamInvoicePdf",
  name: "Vietnamese A4 PDF Generation & Streaming",
  description: "Retrieve invoice, convert total to Vietnamese words, render Vietnamese A4 HTML template with Puppeteer, cache to disk, and stream PDF response with inline/attachment headers"
})
MERGE (d)-[:CONTAINS]->(wf_streamInvoicePdf)

// Workflow Steps
MERGE (ws_pdf_1:WorkflowStep { id: "streamInvoicePdf_step_1", name: "Fetch Invoice & Convert Currency to Vietnamese Words", order: 1 })
MERGE (ws_pdf_2:WorkflowStep { id: "streamInvoicePdf_step_2", name: "Render or Retrieve Cached A4 PDF", order: 2 })
MERGE (ws_pdf_3:WorkflowStep { id: "streamInvoicePdf_step_3", name: "Stream PDF with Content-Disposition Headers", order: 3 })

MERGE (wf_streamInvoicePdf)-[:HAS_STEP]->(ws_pdf_1)
MERGE (wf_streamInvoicePdf)-[:HAS_STEP]->(ws_pdf_2)
MERGE (wf_streamInvoicePdf)-[:HAS_STEP]->(ws_pdf_3)

MERGE (ws_pdf_1)-[:NEXT_STEP]->(ws_pdf_2)
MERGE (ws_pdf_2)-[:NEXT_STEP]->(ws_pdf_3)

// Services (New)
MERGE (s_currencyUtil:Service { id: "CurrencyToWordsUtil", description: "Converts numeric VND amounts into formal Vietnamese words" })

// Functions
MERGE (fn_getInvoicePdfStream:Function {
  id: "getInvoicePdfStream",
  type: "QUERY",
  input: "id: string, isDownload: boolean",
  output: "PdfStreamResultDTO",
  desc: "Checks disk cache or coordinates HTML template compilation and Puppeteer PDF generation",
  roles: "AUTHENTICATED",
  guard: ""
})

MERGE (fn_convertVndToWords:Function {
  id: "convertVndToWords",
  type: "UTILITY",
  input: "amount: number",
  output: "string",
  desc: "Converts numeric VND amount into standardized Vietnamese text description",
  roles: "PUBLIC",
  guard: ""
})

MERGE (fn_generatePdfFromHtml:Function {
  id: "generatePdfFromHtml",
  type: "UTILITY",
  input: "html: string, outputPath: string",
  output: "Buffer",
  desc: "Renders A4 PDF using Puppeteer Core against system Chromium and persists to cache",
  roles: "AUTHENTICATED",
  guard: ""
})

// Service Ownership
MERGE (s_pdfService)-[:OWNS]->(fn_getInvoicePdfStream)
MERGE (s_pdfService)-[:OWNS]->(fn_generatePdfFromHtml)
MERGE (s_currencyUtil)-[:OWNS]->(fn_convertVndToWords)

// Workflow Step Execution
MERGE (ws_pdf_1)-[:EXECUTES]->(fn_getInvoicePdfStream)
MERGE (ws_pdf_1)-[:EXECUTES]->(fn_findByIdRepo)
MERGE (ws_pdf_1)-[:EXECUTES]->(fn_convertVndToWords)
MERGE (ws_pdf_2)-[:EXECUTES]->(fn_generatePdfFromHtml)
MERGE (ws_pdf_3)-[:EXECUTES]->(fn_getInvoicePdfStream)

// Dependencies
MERGE (fn_getInvoicePdfStream)-[:DEPENDS_ON]->(fn_findByIdRepo)
MERGE (fn_getInvoicePdfStream)-[:DEPENDS_ON]->(fn_convertVndToWords)
MERGE (fn_getInvoicePdfStream)-[:DEPENDS_ON]->(fn_generatePdfFromHtml)
