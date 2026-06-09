import type { SchemaField } from "@/types/mapping";

export interface FlatSchemaField {
  path: string;
  type: string;
  required?: boolean;
  mapped?: boolean;
  sampleValue?: string;
}

const SAMPLE_VALUES: Record<string, string> = {
  order_id: "LZD-20240516-001",
  order_number: "ORD-88421",
  order_status: "confirmed",
  order_date: "2024-05-16T14:22:33+07:00",
  update_time: "2024-05-16T15:01:00+07:00",
  customer_id: "CUST-9921",
  customer_name: "John Smith",
  customer_email: "john.smith@example.com",
  customer_phone: "+66812345678",
  sku: "SKU-ABC-001",
  quantity: "2",
  price: "499.00",
  name: "John Smith",
  address1: "123 Sukhumvit Rd",
  city: "Bangkok",
  postal_code: "10110",
  sales_order_no: "SO-100234",
  reference_no: "REF-88421",
  document_date: "2024-05-16",
  sold_to_party: "1000123",
  sold_to_name: "John Smith",
  net_amount: "1070.00",
  currency: "THB",
  material_code: "MAT-001",
  unit_price: "499.00",
};

function defaultSample(type: string, name: string): string {
  if (type === "number" || type === "decimal") return "0";
  if (type === "datetime" || type === "date") return "2024-05-16T14:22:33+07:00";
  if (type === "boolean") return "true";
  return name;
}

export function getFieldSampleValue(path: string, type: string): string {
  const leaf = path.split(".").pop() ?? path;
  return SAMPLE_VALUES[leaf] ?? defaultSample(type, leaf);
}

export function flattenSchemaFields(
  schema: SchemaField[],
  prefix = ""
): FlatSchemaField[] {
  const result: FlatSchemaField[] = [];

  for (const node of schema) {
    const path = prefix ? `${prefix}.${node.name}` : node.name;
    if (node.children?.length) {
      result.push(...flattenSchemaFields(node.children, path));
    } else {
      result.push({
        path,
        type: node.type,
        required: node.required,
        mapped: node.mapped,
        sampleValue: getFieldSampleValue(path, node.type),
      });
    }
  }

  return result;
}

export function findSchemaField(schema: SchemaField[], path: string): FlatSchemaField | undefined {
  return flattenSchemaFields(schema).find((f) => f.path === path);
}
