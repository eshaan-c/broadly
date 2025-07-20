"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Eye, BarChart3, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UpdateItem {
    icon: React.ReactNode
    title: string
    description: string
}

interface UpdateNotificationProps {
    // Allow easy configuration of updates
    version?: string
    updates?: UpdateItem[]
    showByDefault?: boolean
}

const defaultUpdates: UpdateItem[] = [
    {
        icon: <EyeOff className="h-4 w-4" />,
        title: "Blindfold Mode",
        description:
            "Skip the probing questions and jump straight to AI-generated decision analysis.",
    },
    {
        icon: <BarChart3 className="h-4 w-4" />,
        title: "Criteria Breakdown",
        description:
            "Manually adjust criteria weights and instantly see how the final scores shift. Great for exploring different priorities.",
    },
]

export default function UpdateNotification({
    version = "v0.4",
    updates = defaultUpdates,
    showByDefault = true,
}: UpdateNotificationProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        if (!showByDefault) return

        // Check if user has already dismissed this version
        // const dismissedVersion = localStorage.getItem("broadly-dismissed-update")
        // if (dismissedVersion === version) {
        //     setIsDismissed(true)
        //     return
        // }

        // Show notification after a brief delay
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [version, showByDefault])

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        localStorage.setItem("broadly-dismissed-update", version)
    }

    const handleViewFeatures = () => {
        // Scroll to the main form to encourage engagement
        const mainContent = document.querySelector("[data-main-content]")
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        handleDismiss()
    }

    if (isDismissed) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="fixed top-1/3 inset-x-0 mx-auto z-40 pointer-events-auto w-[90%] max-w-[340px] sm:max-w-md px-1"
                >
                    <Card className="bg-slate-800/95 border-slate-600/50 backdrop-blur-xl shadow-2xl">
                        <CardContent className="p-4 sm:p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-emerald-500/20 rounded-full">
                                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-emerald-400">Try out these new features!</h3>
                                        <p className="text-xs text-slate-400">{version}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDismiss}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-smooth -mr-1"
                                >
                                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5">
                                {updates.map((update, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
                                        className="flex items-start space-x-2.5 sm:space-x-3"
                                    >
                                        <div className="p-1.5 bg-slate-700/50 rounded-lg flex-shrink-0 mt-0.5">
                                            <div className="text-slate-300">{update.icon}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-slate-200 mb-0.5 sm:mb-1">{update.title}</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">{update.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex">
                                <Button
                                    onClick={handleViewFeatures}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2 h-auto transition-smooth focus-ring"
                                >
                                    Okay
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-xl -z-10"></div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
