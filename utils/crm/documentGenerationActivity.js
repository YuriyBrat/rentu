import { logActivity } from "@/utils/crm/activityLog";

const DOCUMENT_TYPE_LABELS = {
   sale_deposit: "Договір завдатку продажу",
   sale_buyer_service: "Договір послуг з покупцем",
   sale_seller_service: "Договір послуг з продавцем",
   rent_contract: "Договір оренди",
   rent_deposit: "Договір завдатку оренди",
   rent_service: "Договір послуг оренди",
};

const FIELD_LABELS = {
   nameFOP: "ФОП",
   numberZS: "Номер",
   dateZS: "Дата",
   customerPIB: "Клієнт",
   estateName: "Об'єкт",
   estateAdress: "Адреса",
   estateCost: "Вартість",
   zsAvans: "Завдаток",
   zsCurrency: "Валюта",
   objectName: "Об'єкт",
   objectAddress: "Адреса",
   landlordName: "Орендодавець",
   tenantName: "Орендар",
   tenantPhone: "Телефон орендаря",
   rentEquivalent: "Оренда",
   depositAmount: "Сума при укладенні",
   contractDate: "Дата договору",
};

const SALE_FIELDS = [
   "numberZS",
   "dateZS",
   "customerPIB",
   "estateName",
   "estateAdress",
   "estateCost",
   "zsAvans",
   "zsCurrency",
   "nameFOP",
];

const RENT_FIELDS = [
   "contractDate",
   "objectName",
   "objectAddress",
   "landlordName",
   "tenantName",
   "tenantPhone",
   "rentEquivalent",
   "depositAmount",
];

function idString(value) {
   return value?._id?.toString?.() || value?.toString?.() || "";
}

function cleanText(value) {
   return String(value ?? "").replace(/\s+/g, " ").trim();
}

function pickOptions(fieldsSnapshot = {}, documentDomain = "sale") {
   const fields = documentDomain === "rent" ? RENT_FIELDS : SALE_FIELDS;

   return fields
      .map((field) => ({
         field,
         label: FIELD_LABELS[field] || field,
         value: cleanText(fieldsSnapshot?.[field]),
      }))
      .filter((item) => item.value);
}

export function documentTypeLabel(documentType) {
   return DOCUMENT_TYPE_LABELS[documentType] || documentType || "Договір";
}

export function buildDocumentGenerationTitle(item = {}) {
   const type = documentTypeLabel(item.documentType);
   const fields = item.fieldsSnapshot || {};
   const address = cleanText(fields.estateAdress || fields.objectAddress);
   const client = cleanText(fields.customerPIB || fields.tenantName);
   const number = cleanText(fields.numberZS || fields.contractDateText);
   const fileName = cleanText(item.fileName);

   return [type, address || client || number || fileName].filter(Boolean).join(" · ");
}

export function buildDocumentGenerationMeta(item = {}, extra = {}) {
   const fieldsSnapshot = item.fieldsSnapshot || {};
   const documentDomain = item.documentDomain || (String(item.documentType || "").startsWith("rent_") ? "rent" : "sale");
   const optionsPreview = pickOptions(fieldsSnapshot, documentDomain);

   return {
      pageName: documentDomain === "rent" ? "Генерації оренди" : "Генерації продажу",
      pagePath: documentDomain === "rent" ? "/crm/gen-rent" : "/crm/gen1",
      documentDomain,
      documentType: item.documentType || "",
      documentTypeLabel: documentTypeLabel(item.documentType),
      fileName: item.fileName || "",
      contractNumber: item.contractNumber || "",
      contractDateText: item.contractDateText || "",
      fopName: item.fopName || "",
      propertyId: idString(item.property),
      leadId: idString(item.lead),
      optionsPreview,
      optionsText: optionsPreview.map((entry) => `${entry.label}: ${entry.value}`).join(" | "),
      ...extra,
   };
}

export async function logDocumentGenerationActivity({
   sessionUser,
   item,
   action = "generated",
   message = "",
   source = "api",
   extraMeta = {},
} = {}) {
   if (!item) return null;

   const title = buildDocumentGenerationTitle(item);
   const meta = buildDocumentGenerationMeta(item, extraMeta);

   return logActivity({
      sessionUser,
      entityType: "documentGeneration",
      entityId: item._id,
      action,
      source,
      title,
      message: message || meta.documentTypeLabel,
      before: action === "deleted" ? item : null,
      after: action === "deleted" ? null : item,
      meta,
   });
}
