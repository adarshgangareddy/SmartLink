import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

/**
 * A wrapper component for Pro-only features.
 * If user is not pro, clicking the children will redirect them to /go-pro.
 */
const ProFeature = ({ children, className = "" }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (!user?.is_pro) {
            e.preventDefault();
            e.stopPropagation();
            toast('This is a SmartLink Pro feature!', {
                icon: <Sparkles className="text-yellow-400" />,
                duration: 3000
            });
            navigate('/go-pro');
        }
    };

    return (
        <div 
            onClickCapture={handleClick} 
            className={`${className} ${!user?.is_pro ? 'cursor-pointer' : ''}`}
        >
            <div className={!user?.is_pro ? 'pointer-events-none opacity-80' : ''}>
                {children}
            </div>
        </div>
    );
};

export default ProFeature;
