import React from 'react';

export default function Loader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="loader"></div>
        </div>
    );
}
