"use client";
import React, { useState, useEffect } from "react";
import { getNotificationsRoute } from "@/lib/api/get-notifications/influencer/getNotification.route";
import { deleteNotificationRoute } from "@/lib/api/get-notifications/influencer/deleteNotification.route";
import { useSession } from "next-auth/react";
import Image from "next/image";
import undraw_new_notifications_wvqc from "@/assets/svg/undraw_new-notifications_wvqc.svg";
const NotificationCard = ({
	type,
	category,
	title,
	message,
	user,
	time,
	onDelete,
}) => {
	const typeStyles = {
		social: "bg-green-100 text-green-800",
		eventAction: "bg-orange-100 text-orange-800",
		system: "bg-purple-100 text-purple-800",
		promotional: "bg-blue-100 text-blue-800",
	};

	return (
		<div className="flex items-start p-4 border-b border-gray-200">
			<div className="ml-4 flex-1">
				<div
					className={`px-2 py-1 text-sm rounded ${typeStyles[category]} inline-block`}
				>
					{category === "social" && "Social"}
					{category === "eventAction" && "Event Action"}
					{category === "system" && "System"}
					{category === "promotional" && "Promotional"}
				</div>
				<p className="mt-2 text-sm font-semibold text-red-600">FROM: {user}</p>
				<h4 className="font-medium text-gray-800">{type}</h4>
				<h4 className="font-medium text-gray-800">{title}</h4>
				<p className="text-gray-600 text-sm">{message}</p>
			</div>
			<div className="text-gray-400 text-sm">{time}</div>
			<button
				className="ml-4 px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
				onClick={onDelete}
			>
				Delete
			</button>
		</div>
	);
};

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const { data: theSession } = useSession();

	useEffect(() => {
		async function fetchNotifications() {
			if (!theSession || !theSession.user) {
				console.error("Session not available or user not authenticated.");
				return;
			}

			const session = {
				token: theSession.user.access_token,
				userId: theSession.user._id,
			};

			try {
				const result = await getNotificationsRoute({ session });

				if (result.status === "success") {
					console.log("Fetched notifications:", result.data);
					// Update notifications state with fetched data
					setNotifications(result.data.data || []);
				} else {
					console.error("Failed to fetch notifications:", result.message);
					setNotifications([]); // Reset notifications on error
				}
			} catch (error) {
				console.error("Error fetching notifications:", error.message);
				setNotifications([]); // Reset notifications on error
			}
		}
		async function fetchNotifications() {
			if (!theSession || !theSession.user) {
				console.error("Session not available or user not authenticated.");
				return;
			}

			const session = {
				token: theSession.user.access_token,
				userId: theSession.user._id,
			};

			try {
				const result = await getNotificationsRoute({ session });

				if (result.status === "success") {
					console.log("Fetched notifications:", result.data);
					// Update notifications state with fetched data
					setNotifications(result.data.data || []);
				} else {
					console.error("Failed to fetch notifications:", result.message);
					setNotifications([]); // Reset notifications on error
				}
			} catch (error) {
				console.error("Error fetching notifications:", error.message);
				setNotifications([]); // Reset notifications on error
			}
		}

		if (theSession) {
			fetchNotifications();
		}
	}, [theSession]);

	async function handleDelete(notificationId) {
		console.log("Attempting to delete notification:", notificationId);

		const session = {
			token: theSession?.user?.access_token,
			userId: theSession?.user?._id,
		};

		try {
			const result = await deleteNotificationRoute({ notificationId, session });

			if (result.status === "success") {
				console.log(result.message);
				// Update the state to exclude the deleted notification
				setNotifications((prev) =>
					prev.filter((notif) => notif._id !== notificationId)
				);
			} else {
				console.error("Failed to delete notification:", result.message);
			}
		} catch (error) {
			console.error("Error in handleDelete:", error.message);
		}
	}

	return (
		<div className="w-full bg-white  rounded-lg overflow-hidden">
			{Array.isArray(notifications) && notifications.length > 0 ? (
				notifications.map((notification) => (
					<NotificationCard
						key={notification._id}
						type={notification.type}
						category={notification.category}
						title={notification.subject}
						message={notification.body}
						user={notification.sender_id}
						time={new Date(notification.timestamp).toLocaleString()}
						onDelete={() => handleDelete(notification._id)}
					/>
				))
			) : (
				<div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] w-full">
					<Image
						src={undraw_new_notifications_wvqc}
						alt="No notifications"
						className="w-1/3 h-1/3"
					/>
					<br />
					<p className="text-center p-4 text-2xl text-gray-500">
						No notifications available
					</p>
				</div>
			)}
		</div>
	);
};

export default Notifications;
