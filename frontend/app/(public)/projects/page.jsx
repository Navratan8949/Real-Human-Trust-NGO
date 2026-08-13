import { ProjectsClientPage } from "./ProjectsClientPage"
import { getProjects } from "@/service/project.service"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = { title: "Our Projects" }

export default async function Page() {
  let projects = []
  try {
    const data = await getProjects()
    if (data?.success) {
      projects = data.data || data.projects || []
    }
  } catch (error) {
    console.error("Failed to fetch projects:", error)
  }

  return <ProjectsClientPage initialProjects={projects} />
}
