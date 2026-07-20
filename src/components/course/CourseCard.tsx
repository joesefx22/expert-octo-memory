import Link from 'next/link'
export default function CourseCard({ course }: any) { return <Link href={`/courses/${course.id}`}>{course.title}</Link> }
