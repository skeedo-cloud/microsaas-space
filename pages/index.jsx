import Layout from "./Layout.jsx";

import Landing from "./Landing";

import LandingV2 from "./LandingV2";

import LandingV3 from "./LandingV3";

import AdminDashboard from "./AdminDashboard";

import IdeaValidation from "./IdeaValidation";

import NewsletterSender from "./NewsletterSender";

import IdeaSubmission from "./IdeaSubmission";

import Analytics from "./Analytics";

import AgentPortal from "./AgentPortal.jsx";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    LandingV2: LandingV2,
    
    LandingV3: LandingV3,
    
    AdminDashboard: AdminDashboard,
    
    IdeaValidation: IdeaValidation,
    
    NewsletterSender: NewsletterSender,
    
    IdeaSubmission: IdeaSubmission,
    
    Analytics: Analytics,
    
    AgentPortal: AgentPortal,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/LandingV2" element={<LandingV2 />} />
                
                <Route path="/LandingV3" element={<LandingV3 />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/IdeaValidation" element={<IdeaValidation />} />
                
                <Route path="/NewsletterSender" element={<NewsletterSender />} />
                
                <Route path="/IdeaSubmission" element={<IdeaSubmission />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/agent-dashboard" element={<AgentPortal />} />
                <Route path="/AgentDashboard" element={<AgentPortal />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}