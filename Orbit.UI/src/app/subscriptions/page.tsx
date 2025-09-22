"use client";
import { useState, useEffect } from "react";
import BtnRefresh from "@/components/ui/BtnRefresh";
import Card from "@/components/subscription/card";
import { standardPlans, customPlan } from "@/model/plans";

export default function Page() {
    return (
        <div className="w-full h-full px-12 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Planos</h1>
                <div className="flex justify-center items-center space-x-3">
                    <BtnRefresh />
                </div>
            </div>
            <div className="w-full flex flex-wrap justify-center space-x-4 space-y-4">
                {standardPlans.map((plan, index) => (
                    <Card key={index} {...plan} />
                ))}
                <Card {...customPlan} />
            </div>
        </div>
    );
}