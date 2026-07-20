import { Document, Page, Text } from '@react-pdf/renderer'
export default function CodePDF({ codes, courseTitle }: any) { return <Document><Page><Text>{courseTitle}</Text></Page></Document> }
