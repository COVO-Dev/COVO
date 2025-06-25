"use client"
import ApplyToCampaignFormSkeleton from "./skeleton/ApplyToCampaignSkeleton.component"
import ApplyToCampaignForm from "./form/ApplyToCampaignForm"

export default function ApplyToCampaignSection({ handleSubmit, hasApplied, isLoading, className, form }) {
  return (
    <section className={className}>
      {isLoading ?
        <ApplyToCampaignFormSkeleton /> :
        <>
          <h1 className="pt-[1em] ">
            <strong>Apply to campaign</strong>
          </h1>
          <ApplyToCampaignForm handleSubmit={handleSubmit} hasApplied={hasApplied} form={form} />
        </>

      }
    </section>
  )
}