// enum status {
// 	active = "active",
// 	completed = "completed",
// 	pending = "pending",
// }

export interface IInitialState {
	brandId: string,
	title: string,
	startDate: string,
	endDate: string,
	budgetRange: number,
	targetAudience: string,

	primaryGoals: Array<string>,
	influencerType: string,
	geographicFocus: string,
	collaborationPreferences: {
		hasWorkedWithInfluencers: boolean,
		exclusiveCollaborations: boolean,
		type: string,
		styles: Array<string>,
	},

	trackingAndAnalytics: {
		performanceTracking: boolean,
		metrics: Array<string>,
		reportFrequency: string,
	},
	status: string,
	is_deleted: boolean,
}