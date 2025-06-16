import advanced_customization from "@/assets/svg/advanced_customization.svg";
import dev_focus from "@/assets/svg/dev_focus.svg";
import projections from "@/assets/svg/projections.svg";



export const priceInformation = [
  {
    id: 1,
    imageURL: dev_focus,
    plan: "Beginner",
    price: 39,
    currency: "R",
    duration: "monthly",
    description: "Explore the basics with this introductory course",
    validity: "Valid for 3 months",
    includes: [
      "6 classes",
      "3 individual sessions",
      "Online resources"
    ]
  },
  {
    id: 2,
    imageURL: advanced_customization,
    plan: "Advanced",
    price: 59,
    currency: "R",
    duration: "monthly",
    description: "Perfect for creatives, freelancers, and experienced",
    validity: "Valid for 12 months",
    includes: [
      "6 classes",
      "3 individual sessions",
      "Online resources",
      "1 guest pass",
      "Free WiFi",
      "Weekly newsletter"
    ]
  },
  {
    id: 3,
    imageURL: projections,
    plan: "Pro",
    price: 99,
    currency: "R",
    duration: "monthly",
    description: "Unlimited access to professional content",
    validity: "Valid for 12 months",
    includes: [
      "6 classes",
      "3 individual sessions",
      "Online resources",
      "1 guest pass",
      "Free WiFi",
      "Weekly newsletter",
      "Priority support"
    ]
  }
];