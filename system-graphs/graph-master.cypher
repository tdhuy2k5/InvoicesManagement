// ==============================================================================
// SYSTEM UI GRAPH: InvoiceManagement
// Generated via /generate-graph
// ==============================================================================

// ==============================================================================
// 1. UI NODES (Physical Routes & Views)
// ==============================================================================
MERGE (ui_invoiceList:UINode {
  id: "InvoiceList",
  route: "/invoices",
  title: "Invoice Management - Danh Sách Hóa Đơn",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (ui_invoiceDetail:UINode {
  id: "InvoiceDetail",
  route: "/invoices/:id",
  title: "Invoice Details - Chi Tiết Hóa Đơn",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (ui_invoiceCreate:UINode {
  id: "InvoiceCreate",
  route: "/invoices/new",
  title: "Create Draft Invoice - Lập Hóa Đơn Mới",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (ui_invoiceEdit:UINode {
  id: "InvoiceEdit",
  route: "/invoices/:id/edit",
  title: "Edit Draft Invoice - Chỉnh Sửa Hóa Đơn",
  requiredRole: "AUTHENTICATED",
  visibleIf: "invoice.status == \"DRAFT\""
})

MERGE (ui_invoiceReplace:UINode {
  id: "InvoiceReplace",
  route: "/invoices/:id/replace",
  title: "Replace Issued Invoice - Thay Thế Hóa Đơn",
  requiredRole: "AUTHENTICATED",
  visibleIf: "invoice.status == \"ISSUED\" && invoice.originalInvoiceId == null"
})

// ==============================================================================
// 2. SHARED ISLANDS (Reused UI Component Islands & Modals)
// ==============================================================================
MERGE (island_header:SharedIsland {
  id: "GlobalHeaderIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_filter:SharedIsland {
  id: "InvoiceFilterIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_table:SharedIsland {
  id: "InvoiceTableIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_headerDetail:SharedIsland {
  id: "InvoiceHeaderDetailIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_partyInfo:SharedIsland {
  id: "InvoicePartyInfoIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_itemsTable:SharedIsland {
  id: "InvoiceItemsTableIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_summary:SharedIsland {
  id: "InvoiceSummaryIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_pdfViewer:SharedIsland {
  id: "InvoicePdfViewerIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_form:SharedIsland {
  id: "InvoiceFormIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: ""
})

MERGE (island_replaceBanner:SharedIsland {
  id: "InvoiceReplacementBannerIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: "invoice.status == \"ISSUED\""
})

MERGE (island_issueModal:SharedIsland {
  id: "InvoiceIssueModalIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: "invoice.status == \"DRAFT\""
})

MERGE (island_cancelModal:SharedIsland {
  id: "InvoiceCancelModalIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: "invoice.status == \"ISSUED\""
})

MERGE (island_deleteModal:SharedIsland {
  id: "InvoiceDeleteModalIsland",
  requiredRole: "AUTHENTICATED",
  visibleIf: "invoice.status == \"DRAFT\""
})

// ==============================================================================
// 3. MOUNTS RELATIONSHIPS (Pages Mount Islands)
// ==============================================================================
MERGE (ui_invoiceList)-[:MOUNTS]->(island_header)
MERGE (ui_invoiceList)-[:MOUNTS]->(island_filter)
MERGE (ui_invoiceList)-[:MOUNTS]->(island_table)
MERGE (ui_invoiceList)-[:MOUNTS]->(island_deleteModal)
MERGE (ui_invoiceList)-[:MOUNTS]->(island_cancelModal)

MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_header)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_headerDetail)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_partyInfo)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_itemsTable)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_summary)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_pdfViewer)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_issueModal)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_cancelModal)
MERGE (ui_invoiceDetail)-[:MOUNTS]->(island_deleteModal)

MERGE (ui_invoiceCreate)-[:MOUNTS]->(island_header)
MERGE (ui_invoiceCreate)-[:MOUNTS]->(island_form)

MERGE (ui_invoiceEdit)-[:MOUNTS]->(island_header)
MERGE (ui_invoiceEdit)-[:MOUNTS]->(island_form)

MERGE (ui_invoiceReplace)-[:MOUNTS]->(island_header)
MERGE (ui_invoiceReplace)-[:MOUNTS]->(island_replaceBanner)
MERGE (ui_invoiceReplace)-[:MOUNTS]->(island_form)

// ==============================================================================
// 4. NAVIGATION & ACTION EDGES (:NAVIGATES_TO)
// ==============================================================================
MERGE (island_header)-[:NAVIGATES_TO { actionId: "navigateToInvoiceList", label: "Danh Sách Hóa Đơn" }]->(ui_invoiceList)
MERGE (island_header)-[:NAVIGATES_TO { actionId: "navigateToCreateInvoice", label: "Tạo Hóa Đơn Mới" }]->(ui_invoiceCreate)

MERGE (island_table)-[:NAVIGATES_TO { actionId: "viewInvoiceDetail", label: "Xem Chi Tiết" }]->(ui_invoiceDetail)
MERGE (island_table)-[:NAVIGATES_TO { actionId: "editDraftInvoice", label: "Sửa Bản Nháp" }]->(ui_invoiceEdit)
MERGE (island_table)-[:NAVIGATES_TO { actionId: "replaceIssuedInvoice", label: "Thay Thế Hóa Đơn" }]->(ui_invoiceReplace)

MERGE (island_headerDetail)-[:NAVIGATES_TO { actionId: "backToInvoiceList", label: "Quay Lại Danh Sách" }]->(ui_invoiceList)
MERGE (island_headerDetail)-[:NAVIGATES_TO { actionId: "editDraftFromDetail", label: "Chỉnh Sửa" }]->(ui_invoiceEdit)
MERGE (island_headerDetail)-[:NAVIGATES_TO { actionId: "replaceInvoiceFromDetail", label: "Lập Hóa Đơn Thay Thế" }]->(ui_invoiceReplace)
MERGE (island_headerDetail)-[:NAVIGATES_TO { actionId: "viewReplacedInvoice", label: "Xem Hóa Đơn Gốc" }]->(ui_invoiceDetail)
MERGE (island_headerDetail)-[:NAVIGATES_TO { actionId: "viewReplacementInvoice", label: "Xem Hóa Đơn Thay Thế" }]->(ui_invoiceDetail)

MERGE (island_deleteModal)-[:NAVIGATES_TO { actionId: "confirmDeleteDraftFromDetail", label: "Xóa Bản Nháp" }]->(ui_invoiceList)

MERGE (island_form)-[:NAVIGATES_TO { actionId: "cancelFormAndReturnToList", label: "Hủy Bỏ Về Danh Sách" }]->(ui_invoiceList)
MERGE (island_form)-[:NAVIGATES_TO { actionId: "cancelFormAndReturnToDetail", label: "Hủy Bỏ Về Chi Tiết" }]->(ui_invoiceDetail)

// ==============================================================================
// 5. STATE MUTATIONS (:MUTATES_STATE) — BOUND TO BACKEND FUNCTIONS
// ==============================================================================
MERGE (ui_invoiceList)-[:MUTATES_STATE { actionId: "fetchInitialInvoicesList", executes: "getInvoicesList", payload: "query: GetInvoicesQueryDTO" }]->(ui_invoiceList)
MERGE (ui_invoiceDetail)-[:MUTATES_STATE { actionId: "fetchInvoiceDetail", executes: "getInvoiceById", payload: "id: string" }]->(ui_invoiceDetail)
MERGE (ui_invoiceEdit)-[:MUTATES_STATE { actionId: "fetchInvoiceForEdit", executes: "getInvoiceById", payload: "id: string" }]->(ui_invoiceEdit)
MERGE (ui_invoiceReplace)-[:MUTATES_STATE { actionId: "fetchOriginalForReplacement", executes: "getInvoiceById", payload: "id: string" }]->(ui_invoiceReplace)

MERGE (island_filter)-[:MUTATES_STATE { actionId: "searchInvoices", executes: "searchInvoices", payload: "query: SearchInvoicesQueryDTO" }]->(island_table)
MERGE (island_filter)-[:MUTATES_STATE { actionId: "filterInvoices", executes: "getInvoicesList", payload: "query: GetInvoicesQueryDTO" }]->(island_table)

MERGE (island_table)-[:MUTATES_STATE { actionId: "cloneInvoiceFromList", executes: "cloneInvoice", payload: "id: string" }]->(island_table)
MERGE (island_table)-[:MUTATES_STATE { actionId: "openDeleteModal", executes: "validateDraftModification", payload: "currentStatus: InvoiceStatus" }]->(island_deleteModal)
MERGE (island_table)-[:MUTATES_STATE { actionId: "openCancelModal", executes: "validateCancelTransition", payload: "currentStatus: InvoiceStatus" }]->(island_cancelModal)

MERGE (island_headerDetail)-[:MUTATES_STATE { actionId: "cloneInvoiceFromDetail", executes: "cloneInvoice", payload: "id: string" }]->(ui_invoiceDetail)
MERGE (island_headerDetail)-[:MUTATES_STATE { actionId: "openIssueModal", executes: "validateIssueTransition", payload: "currentStatus: InvoiceStatus" }]->(island_issueModal)
MERGE (island_headerDetail)-[:MUTATES_STATE { actionId: "openCancelModalFromDetail", executes: "validateCancelTransition", payload: "currentStatus: InvoiceStatus" }]->(island_cancelModal)
MERGE (island_headerDetail)-[:MUTATES_STATE { actionId: "openDeleteModalFromDetail", executes: "validateDraftModification", payload: "currentStatus: InvoiceStatus" }]->(island_deleteModal)

MERGE (island_deleteModal)-[:MUTATES_STATE { actionId: "confirmDeleteDraft", executes: "deleteDraftInvoice", payload: "id: string" }]->(island_table)
MERGE (island_cancelModal)-[:MUTATES_STATE { actionId: "confirmCancelInvoice", executes: "cancelInvoice", payload: "id: string, dto: CancelInvoiceDTO" }]->(ui_invoiceDetail)
MERGE (island_issueModal)-[:MUTATES_STATE { actionId: "confirmIssueInvoice", executes: "issueInvoice", payload: "id: string" }]->(ui_invoiceDetail)

MERGE (island_pdfViewer)-[:MUTATES_STATE { actionId: "previewPdfStream", executes: "getInvoicePdfStream", payload: "id: string, isDownload: boolean" }]->(island_pdfViewer)
MERGE (island_pdfViewer)-[:MUTATES_STATE { actionId: "downloadPdfFile", executes: "getInvoicePdfStream", payload: "id: string, isDownload: boolean" }]->(island_pdfViewer)

MERGE (island_summary)-[:MUTATES_STATE { actionId: "renderVietnameseCurrencyWords", executes: "convertVndToWords", payload: "amount: number" }]->(island_summary)

MERGE (island_form)-[:MUTATES_STATE { actionId: "recalculateTotals", executes: "calculateInvoiceTotals", payload: "items: CreateInvoiceItemDTO[], vatRate: number" }]->(island_form)
MERGE (island_form)-[:MUTATES_STATE { actionId: "liveConvertVndToWords", executes: "convertVndToWords", payload: "amount: number" }]->(island_form)
MERGE (island_form)-[:MUTATES_STATE { actionId: "submitDraftInvoice", executes: "createDraftInvoice", payload: "dto: CreateInvoiceDTO" }]->(ui_invoiceDetail)
MERGE (island_form)-[:MUTATES_STATE { actionId: "submitUpdateDraft", executes: "updateDraftInvoice", payload: "id: string, dto: UpdateInvoiceDTO" }]->(ui_invoiceDetail)
MERGE (island_form)-[:MUTATES_STATE { actionId: "submitReplaceInvoice", executes: "replaceInvoice", payload: "id: string, dto: ReplaceInvoiceDTO" }]->(ui_invoiceDetail)

// ==============================================================================
// 6. UI TRANSITIONS & DYNAMIC FEEDBACK (:TRANSITIONS_TO)
// ==============================================================================
MERGE (island_form)-[:TRANSITIONS_TO { if: "isSubmitting == true", animation: "pulse" }]->(island_form)
MERGE (island_form)-[:TRANSITIONS_TO { if: "validationError != null", animation: "shake" }]->(island_form)
MERGE (island_pdfViewer)-[:TRANSITIONS_TO { if: "isLoadingPdf == true", animation: "pulse" }]->(island_pdfViewer)
MERGE (island_table)-[:TRANSITIONS_TO { if: "isLoadingList == true", animation: "fadeIn" }]->(island_table)
MERGE (island_deleteModal)-[:TRANSITIONS_TO { if: "isOpen == true", animation: "scaleUp" }]->(island_deleteModal)
MERGE (island_cancelModal)-[:TRANSITIONS_TO { if: "isOpen == true", animation: "scaleUp" }]->(island_cancelModal)
MERGE (island_issueModal)-[:TRANSITIONS_TO { if: "isOpen == true", animation: "scaleUp" }]->(island_issueModal)
;
