import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    padding: 40,
    textAlign: 'center',
    border: '10px solid #2563eb',
    borderRadius: 20,
    margin: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 20,
    marginTop: 30,
  },
  subtitle: { fontSize: 16, color: '#4b5563', marginBottom: 30 },
  name: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20 },
  body: { fontSize: 14, color: '#374151', marginBottom: 40, lineHeight: 1.8 },
  code: { fontSize: 10, color: '#9ca3af', marginTop: 50 },
})

export default function CertificatePDF({
  studentName,
  courseTitle,
  issueDate,
  code,
}: {
  studentName: string
  courseTitle: string
  issueDate: string
  code: string
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>شهادة إتمام</Text>
        <Text style={styles.subtitle}>تشهد منصة Edu Platform أن</Text>
        <Text style={styles.name}>{studentName}</Text>
        <Text style={styles.body}>
          قد أتم بنجاح كورس{"\n"}
          {courseTitle}{"\n"}
          بتاريخ {issueDate}
        </Text>
        <Text style={styles.code}>رمز التحقق: {code}</Text>
      </Page>
    </Document>
  )
}