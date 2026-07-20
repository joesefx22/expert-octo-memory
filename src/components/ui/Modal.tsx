export default function Modal({ open, onClose, children }: any) { return open ? <div>{children}<button onClick={onClose}>x</button></div> : null }
