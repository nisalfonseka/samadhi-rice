import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { formatLKR } from "@/lib/pricing";

type Item = {
  name: string;
  weightKg: number;
  quantity: number;
  unitPrice: number;
};

export type InvoiceData = {
  orderNo: string;
  createdAt: Date;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: Item[];
};

const HUSK = "#221f17";
const HUSK_SOFT = "#45402f";
const MUTED = "#6e6a55";
const PADDY = "#324327";
const PADDY_DEEP = "#1d2916";
const HARVEST = "#c79a3b";
const HARVEST_DARK = "#856120";
const RICE_50 = "#fbf8f0";
const RICE_100 = "#f7f1e4";
const RULE = "#d8cdb1";

const s = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 56,
    paddingHorizontal: 44,
    backgroundColor: "#ffffff",
    color: HUSK,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    lineHeight: 1.5,
  },
  /* header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandWord: { fontFamily: "Times-Bold", fontSize: 20, color: HUSK },
  brandWordAccent: { color: HARVEST_DARK },
  brandTld: { fontSize: 9, color: MUTED, marginLeft: 1 },
  brandTagline: { marginTop: 2, fontSize: 8.5, color: MUTED, letterSpacing: 1 },
  /* invoice meta */
  metaCol: { alignItems: "flex-end" },
  invoiceLabel: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    letterSpacing: 4,
    color: PADDY,
  },
  metaLine: { fontSize: 10, color: HUSK_SOFT, marginTop: 2 },
  metaOrderNo: {
    marginTop: 4,
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: HUSK,
    letterSpacing: 1,
  },
  /* gold rule */
  rule: { marginVertical: 18, height: 1, backgroundColor: HARVEST },
  /* parties */
  parties: { flexDirection: "row", gap: 24, marginTop: 4 },
  party: { flex: 1 },
  partyLabel: {
    fontFamily: "Times-Bold",
    fontSize: 8.5,
    letterSpacing: 1.8,
    color: HARVEST_DARK,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  partyName: { fontFamily: "Times-Bold", fontSize: 11, color: HUSK },
  partyLine: { fontSize: 10, color: HUSK_SOFT },
  /* status pill */
  statusRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 8.5,
    fontFamily: "Times-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pillStatus: { backgroundColor: PADDY, color: RICE_50 },
  pillPay: { backgroundColor: HARVEST, color: PADDY_DEEP },
  /* table */
  table: { marginTop: 18, borderRadius: 6, overflow: "hidden" },
  tHead: {
    flexDirection: "row",
    backgroundColor: RICE_100,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  tHeadCell: {
    fontFamily: "Times-Bold",
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: HUSK_SOFT,
    textTransform: "uppercase",
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: RULE,
  },
  tRowAlt: { backgroundColor: RICE_50 },
  cellItem: { flex: 5 },
  cellQty: { flex: 1, textAlign: "center" },
  cellUnit: { flex: 2, textAlign: "right" },
  cellAmount: { flex: 2, textAlign: "right" },
  itemName: { fontFamily: "Times-Bold", fontSize: 10.5, color: HUSK },
  itemSub: { fontSize: 9, color: MUTED, marginTop: 1 },
  cellText: { fontSize: 10.5, color: HUSK },
  /* totals */
  totals: { alignItems: "flex-end", marginTop: 16 },
  totalsBox: { width: 230 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: { fontSize: 10.5, color: HUSK_SOFT },
  totalsValue: { fontSize: 10.5, color: HUSK },
  totalsDivider: {
    marginVertical: 6,
    height: 0.6,
    backgroundColor: RULE,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    backgroundColor: PADDY_DEEP,
    color: RICE_50,
    borderRadius: 6,
  },
  grandLabel: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    letterSpacing: 2,
    color: RICE_100,
  },
  grandValue: {
    fontFamily: "Times-Bold",
    fontSize: 15,
    color: HARVEST,
    letterSpacing: 0.5,
  },
  /* notes */
  notesBox: {
    marginTop: 18,
    padding: 10,
    backgroundColor: RICE_50,
    borderLeftWidth: 2,
    borderLeftColor: HARVEST,
    borderRadius: 4,
  },
  notesLabel: {
    fontFamily: "Times-Bold",
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: HARVEST_DARK,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  notesText: { fontSize: 10, color: HUSK_SOFT, fontStyle: "italic" },
  /* footer */
  footerWrap: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
  },
  footerThanks: {
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 11,
    color: PADDY,
    marginBottom: 8,
  },
  footerLine: { height: 0.6, backgroundColor: RULE, marginBottom: 8 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: MUTED,
  },
  footerColRight: { textAlign: "right" },
  /* corner accents */
  cornerTL: { position: "absolute", top: 18, left: 18 },
  cornerBR: { position: "absolute", bottom: 18, right: 18 },
});

function GrainSheaf({ color = HARVEST, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d="M12 23V7.5" stroke={color} strokeWidth={1.4} />
      <Path d="M12 3.2c1.5 1.1 1.5 3.5 0 4.6-1.5-1.1-1.5-3.5 0-4.6Z" fill={color} />
      <Path d="M12 8.4c2.5-.3 4 1 4.2 3.1-2.1.3-3.8-.8-4.2-3.1Z" fill={color} />
      <Path d="M12 8.4c-2.5-.3-4 1-4.2 3.1 2.1.3 3.8-.8 4.2-3.1Z" fill={color} />
      <Path d="M12 12.6c2.3-.3 3.7 1 3.9 2.9-2 .3-3.5-.8-3.9-2.9Z" fill={color} />
      <Path d="M12 12.6c-2.3-.3-3.7 1-3.9 2.9 2 .3 3.5-.8 3.9-2.9Z" fill={color} />
      <Path d="M12 16.8c2-.3 3.3 1 3.5 2.7-1.8.3-3.1-.7-3.5-2.7Z" fill={color} />
      <Path d="M12 16.8c-2-.3-3.3 1-3.5 2.7 1.8.3 3.1-.7 3.5-2.7Z" fill={color} />
    </Svg>
  );
}

function CornerOrnament() {
  return (
    <Svg viewBox="0 0 60 60" style={{ width: 36, height: 36 }}>
      <Path d="M2 30 H 22 M30 2 V 22" stroke={HARVEST} strokeWidth={0.6} />
      <Path d="M2 2 L 2 12 M 2 2 L 12 2" stroke={HARVEST} strokeWidth={0.8} />
    </Svg>
  );
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" });

const fmtDateTime = (d: Date) =>
  d.toLocaleString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function InvoicePage({ data }: { data: InvoiceData }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.cornerTL}>
        <CornerOrnament />
      </View>

      <View style={s.header} fixed>
        <View>
          <View style={s.brandRow}>
            <GrainSheaf />
            <View>
              <Text>
                <Text style={s.brandWord}>Samadhi</Text>
                <Text style={[s.brandWord, s.brandWordAccent]}>Rice</Text>
                <Text style={s.brandTld}> .lk</Text>
              </Text>
              <Text style={s.brandTagline}>FROM THE PADDY FIELD TO YOUR PLATE</Text>
            </View>
          </View>
        </View>

        <View style={s.metaCol}>
          <Text style={s.invoiceLabel}>INVOICE</Text>
          <Text style={s.metaLine}>Issued {fmtDate(data.createdAt)}</Text>
          <Text style={s.metaOrderNo}>{data.orderNo}</Text>
        </View>
      </View>

      <View style={s.rule} />

      {/* parties */}
      <View style={s.parties}>
        <View style={s.party}>
          <Text style={s.partyLabel}>Billed to</Text>
          <Text style={s.partyName}>{data.customerName}</Text>
          <Text style={s.partyLine}>{data.phone}</Text>
          {data.email ? <Text style={s.partyLine}>{data.email}</Text> : null}
        </View>
        <View style={s.party}>
          <Text style={s.partyLabel}>Deliver to</Text>
          <Text style={s.partyLine}>{data.addressLine}</Text>
          <Text style={s.partyLine}>
            {data.city}
            {data.district ? `, ${data.district}` : ""}
          </Text>
          <Text style={s.partyLine}>Sri Lanka</Text>
        </View>
        <View style={s.party}>
          <Text style={s.partyLabel}>Payment</Text>
          <Text style={s.partyLine}>
            {data.paymentMethod === "COD" ? "Cash on Delivery" : "PayHere"}
          </Text>
          <Text style={s.partyLine}>{data.paymentStatus.toLowerCase()}</Text>
          <View style={s.statusRow}>
            <Text style={[s.pill, s.pillStatus]}>{data.status}</Text>
          </View>
        </View>
      </View>

      {/* items */}
      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={[s.tHeadCell, s.cellItem]}>Item</Text>
          <Text style={[s.tHeadCell, s.cellQty]}>Qty</Text>
          <Text style={[s.tHeadCell, s.cellUnit]}>Unit</Text>
          <Text style={[s.tHeadCell, s.cellAmount]}>Amount</Text>
        </View>
        {data.items.map((it, idx) => (
          <View key={idx} style={[s.tRow, idx % 2 === 1 ? s.tRowAlt : null].filter(Boolean) as never}>
            <View style={s.cellItem}>
              <Text style={s.itemName}>{it.name}</Text>
              <Text style={s.itemSub}>{it.weightKg}kg pack · milled to order</Text>
            </View>
            <Text style={[s.cellText, s.cellQty]}>{it.quantity}</Text>
            <Text style={[s.cellText, s.cellUnit]}>{formatLKR(it.unitPrice)}</Text>
            <Text style={[s.cellText, s.cellAmount]}>
              {formatLKR(it.unitPrice * it.quantity)}
            </Text>
          </View>
        ))}
      </View>

      {/* totals */}
      <View style={s.totals}>
        <View style={s.totalsBox}>
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>Subtotal</Text>
            <Text style={s.totalsValue}>{formatLKR(data.subtotal)}</Text>
          </View>
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>Delivery</Text>
            <Text style={s.totalsValue}>
              {data.deliveryFee === 0 ? "Free" : formatLKR(data.deliveryFee)}
            </Text>
          </View>
          <View style={s.totalsDivider} />
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>TOTAL</Text>
            <Text style={s.grandValue}>{formatLKR(data.total)}</Text>
          </View>
        </View>
      </View>

      {/* notes */}
      {data.notes ? (
        <View style={s.notesBox}>
          <Text style={s.notesLabel}>Delivery notes</Text>
          <Text style={s.notesText}>{data.notes}</Text>
        </View>
      ) : null}

      {/* footer */}
      <View style={s.footerWrap} fixed>
        <Text style={s.footerThanks}>Thank you for choosing SamadhiRice.lk</Text>
        <View style={s.footerLine} />
        <View style={s.footerRow}>
          <View>
            <Text>SamadhiRice.lk · No. 42 Negombo Road, Wattala, Sri Lanka</Text>
            <Text>hello@samadhirice.lk · +94 77 000 0000</Text>
          </View>
          <View style={s.footerColRight}>
            <Text>Invoice {data.orderNo}</Text>
            <Text>{fmtDateTime(data.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={s.cornerBR}>
        <CornerOrnament />
      </View>
    </Page>
  );
}

/** Single invoice document. */
export function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document
      author="SamadhiRice.lk"
      title={`Invoice ${data.orderNo}`}
      subject={`Invoice for order ${data.orderNo}`}
      creator="SamadhiRice.lk"
    >
      <InvoicePage data={data} />
    </Document>
  );
}

/** Bulk invoice document — one page per order, ready for batch printing. */
export function InvoiceBatchDocument({ orders }: { orders: InvoiceData[] }) {
  return (
    <Document
      author="SamadhiRice.lk"
      title={`SamadhiRice invoices · ${orders.length} orders`}
      creator="SamadhiRice.lk"
    >
      {orders.map((o) => (
        <InvoicePage key={o.orderNo} data={o} />
      ))}
    </Document>
  );
}
