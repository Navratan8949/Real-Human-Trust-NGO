"use client"
import { useState } from "react"
import { PageHero } from "@/components/pages/page-hero"
import { CardsGrid } from "@/components/pages/cards-grid"

const SAMPLE_PROJECTS = [
  {
    _id: "sample-proj-1",
    title: "Kanya Daan – Girl Child Education",
    description: "Help 100 girl children from poor families complete their schooling and college education with tuition, books, and uniforms.",
    goalAmount: 100000,
    raisedAmount: 9999,
    status: "active",
    category: "Education",
    isFeatured: true,
    image: "/smiling-school-children-india-education.png"
  },
  {
    _id: "sample-proj-2",
    title: "Vedic Gurukul Education Fund",
    description: "Sponsor a child's education in traditional Vedic gurukul system blended with modern computer science and mathematics.",
    goalAmount: 30000,
    raisedAmount: 15000,
    status: "active",
    category: "Education",
    isFeatured: false,
    image: "/rural-classroom-children-learning-india.png"
  },
  {
    _id: "sample-proj-3",
    title: "Gau Shala Construction – Mathura",
    description: "Help us build a shelter, fodder storage, and medical care unit for 500+ abandoned cows in Mathura's sacred land.",
    goalAmount: 60000,
    raisedAmount: 27000,
    status: "upcoming",
    category: "Animal Welfare",
    isFeatured: false,
    image: "/community-health-camp-india.png"
  },
  {
    _id: "sample-proj-4",
    title: "Women Skill Development & Sewing Center",
    description: "Empowering 120 rural women with free vocational sewing machines, cloth production, and self-employment training.",
    goalAmount: 50000,
    raisedAmount: 50000,
    status: "completed",
    category: "Empowerment",
    isFeatured: false,
    image: "/women-skill-training-workshop-india.png"
  }
];

export function ProjectsClientPage({ initialProjects = [] }) {
  const [selectedStatus, setSelectedStatus] = useState("all")

  const allProjectsList = initialProjects.length > 0 ? initialProjects : SAMPLE_PROJECTS;

  const filteredProjects = selectedStatus === "all"
    ? allProjectsList
    : allProjectsList.filter(p => p.status?.toLowerCase() === selectedStatus);

  const statuses = [
    { label: "All Projects", value: "all", count: allProjectsList.length },
    { label: "Active", value: "active", count: allProjectsList.filter(p => p.status === "active").length },
    { label: "Upcoming", value: "upcoming", count: allProjectsList.filter(p => p.status === "upcoming").length },
    { label: "Completed", value: "completed", count: allProjectsList.filter(p => p.status === "completed").length },
  ];

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Our Projects"
        description="Ongoing, upcoming, and completed initiatives creating real impact across Gujarat."
        image="/rural-classroom-children-learning-india.png"
      />

      <section className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {statuses.map(tab => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  selectedStatus === tab.value
                    ? "bg-navy text-white shadow-md shadow-navy/20 scale-105"
                    : "bg-secondary/80 text-foreground/80 hover:bg-secondary hover:text-navy"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <CardsGrid items={filteredProjects} type="project" />
        </div>
      </section>
    </>
  )
}
