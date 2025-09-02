import TeacherSidebar from "./TeacherSidebar"
import Navbar from "./Navbar"
import "../../styles/Layout.css"

const TeacherLayout = ({ children }) => {
  return (
    <div className="layout">
      <TeacherSidebar />
      <div className="layout-main">
        <Navbar />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  )
}

export default TeacherLayout
