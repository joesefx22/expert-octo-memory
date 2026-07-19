import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { fontFamily: 'Cairo', padding: 30, direction: 'rtl' },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 15, textAlign: 'center', color: '#1e40af' },
  table: { display: 'flex', width: '100%', border: '1px solid #d1d5db', borderRadius: 4 },
  row: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', minHeight: 30, alignItems: 'center' },
  header: { backgroundColor: '#eff6ff', fontWeight: 700 },
  cell: { flex: 1, padding: 5, fontSize: 10, textAlign: 'center' },
})

export default function CodePDF({ codes, courseTitle }: { codes: string[]; courseTitle: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>أكواد شراء: {courseTitle}</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cell}>#</Text>
            <Text style={styles.cell}>الكود</Text>
          </View>
          {codes.map((code, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={styles.cell}>{idx + 1}</Text>
              <Text style={styles.cell}>{code}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register Arabic font (Cairo)
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS4J0.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    padding: 30,
    direction: 'rtl',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 15,
    textAlign: 'center',
    color: '#1e40af',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#eff6ff',
    fontWeight: 700,
  },
  cell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
})

export default function CodePDF({ codes, lectureTitle }: { codes: string[]; lectureTitle: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>أكواد شراء المحاضرة: {lectureTitle}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cell}>#</Text>
            <Text style={styles.cell}>الكود</Text>
          </View>
          {codes.map((code, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.cell}>{index + 1}</Text>
              <Text style={styles.cell}>{code}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</Text>
      </Page>
    </Document>
  )
}