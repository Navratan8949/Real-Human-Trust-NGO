import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { PageHero } from "@/components/pages/page-hero";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { getTestimonials } from "@/service/testimonial.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Testimonials",
};

const SAMPLE_TESTIMONIALS = [
  {
    _id: "sample-1",
    name: "Sunita Ben Parmar",
    designation: "Skill Center Graduate",
    message: "Real Human Trust provided free sewing machines and vocational training to 40 women in our village. Today, I earn an independent monthly income supporting my children's school fees.",
    rating: 5,
    image: "/women-skill-training-workshop-india.png"
  },
  {
    _id: "sample-2",
    name: "Dr. Rajesh Shah",
    designation: "Volunteer Doctor & Donor",
    message: "Working with Real Human Trust during rural healthcare camps in Rajkot district showed me their genuine transparency and deep commitment to helping underprivileged families.",
    rating: 5,
    image: "/community-health-camp-india.png"
  },
  {
    _id: "sample-3",
    name: "Ramesh Bhai Patel",
    designation: "Parent & Beneficiary",
    message: "My daughter received a complete 1-year education scholarship including books and uniforms. The trust truly transforms lives at the ground level.",
    rating: 5,
    image: "/smiling-school-children-india-education.png"
  },
  {
    _id: "sample-4",
    name: "Pooja Varma",
    designation: "Youth Volunteer",
    message: "Being a volunteer in the daily community kitchen initiative opened my eyes to how small daily efforts can feed hundreds of needy elders and children.",
    rating: 5,
    image: "/community-kitchen-serving-food-india.png"
  },
  {
    _id: "sample-5",
    name: "Vikram Rathod",
    designation: "Lifetime NGO Member",
    message: "The audit reports and 80G tax benefit compliance are 100% transparent. I proudly recommend donating to Real Human Education & Charitable Trust.",
    rating: 5,
    image: "/about-volunteers-india.png"
  },
  {
    _id: "sample-6",
    name: "Anjali Dave",
    designation: "Education Scholar",
    message: "The education fund helped us learn modern science along with moral values and cultural heritage. I am deeply thankful to all donors and supporters.",
    rating: 5,
    image: "/rural-classroom-children-learning-india.png"
  }
];

export default async function Page() {
  let testimonials = [];
  try {
    const res = await getTestimonials();
    testimonials = res?.testimonials?.filter(t => t.status !== 'inactive') || [];
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
  }

  const displayTestimonials = testimonials.length > 0 ? testimonials : SAMPLE_TESTIMONIALS;

  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Voices from Our Community"
        description="Stories of hope, impact, and transformation shared by our beneficiaries, volunteers, and supporters."
        image="/women-skill-training-workshop-india.png"
      />

      <section className="bg-gradient-to-b from-background to-muted/20 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">

          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              What People Say About Us
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
              Every contribution creates a real impact. These stories reflect
              the lives touched through education, healthcare, women
              empowerment, and community development initiatives.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {displayTestimonials.map((item) => (
              <TestimonialCard key={item._id} item={item} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}