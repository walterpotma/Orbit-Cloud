"use client";

export default function Page() {
    return (
        <div className="h-screen">
            <div className="w-4/5 h-4/5 p-4 m-4 border flex">
                <div className="max-w-96 h-full pr-4 border-r flex flex-1 flex-col gap-4">
                    <div className="w-full border p-4">

                    </div>
                    <div className="w-full h-20 border"></div>
                    <div className="w-full h-20 border"></div>
                    <div className="w-full h-20 border"></div>
                    <div className="w-full h-20 border"></div>
                    <div className="w-full h-20 border"></div>
                    <div className="w-full h-20 border"></div>
                    <div className="w-full h-20 border"></div>
                </div>
                <div className="w-full pl-4 flex flex-1 flex-col gap-4">
                    <div className="w-full h-20 p-4 border">

                    </div>
                    <div className="w-full h-full flex flex-col gap-4">
                        <div className="w-80 h-30 mr-full border"></div>
                        <div className="w-80 h-30 ml-175 border"></div>
                        <div className="w-80 h-30 mr-100 border"></div>
                        <div className="w-80 h-30 ml-175 border"></div>
                    </div>
                    <div className="w-full h-10 border">

                    </div>
                </div>
            </div>
            <div className="w-4/5 h-4/5 p-4 m-4 border flex gap-3">
                <div className="w-1/3 h-full border"></div>
                <div className="w-1/3 h-full border"></div>
                <div className="w-1/3 h-full border"></div>
            </div>
        </div>
    );
}