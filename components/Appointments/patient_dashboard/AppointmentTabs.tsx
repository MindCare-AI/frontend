"use client"

import type React from "react"
import { useState } from "react"
import { View } from "react-native"
import UpcomingAppointments from "./UpcomingAppointments"
import PastAppointments from "./PastAppointments"
import WaitingList from "./WaitingList"
import { Tabs, TabContent } from "./ui"

type AppointmentTabsProps = {
  onOpenFeedback: (appointment: any) => void
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ onOpenFeedback }) => {
  const [activeTab, setActiveTab] = useState("upcoming")

  const tabs = [
    { key: "upcoming", title: "Upcoming" },
    { key: "past", title: "Past" },
    { key: "waiting", title: "Waiting List" },
  ]

  return (
    <View style={{ flex: 1 }}>
      <Tabs tabs={tabs} initialTab="upcoming" onChange={setActiveTab} style={{ marginBottom: 16 }} />

      <View style={{ flex: 1 }}>
        <TabContent tabKey="upcoming" activeTab={activeTab}>
          <UpcomingAppointments />
        </TabContent>

        <TabContent tabKey="past" activeTab={activeTab}>
          <PastAppointments onOpenFeedback={onOpenFeedback} />
        </TabContent>

        <TabContent tabKey="waiting" activeTab={activeTab}>
          <WaitingList />
        </TabContent>
      </View>
    </View>
  )
}

export default AppointmentTabs
