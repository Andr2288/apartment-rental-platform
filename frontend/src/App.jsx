import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import AiAssistantPage from "./pages/AiAssistantPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import ListingsPage from "./pages/ListingsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import MyListingEditorPage from "./pages/MyListingEditorPage.jsx";
import MyListingsPage from "./pages/MyListingsPage.jsx";
import AdminStatsPage from "./pages/AdminStatsPage.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="listings/:listingId" element={<ListingDetailPage />} />
                        <Route path="listings" element={<ListingsPage />} />
                        <Route path="my-listings/new" element={<MyListingEditorPage create />} />
                        <Route path="my-listings/:listingId/edit" element={<MyListingEditorPage />} />
                        <Route path="my-listings" element={<MyListingsPage />} />
                        <Route path="admin-stats" element={<AdminStatsPage />} />
                        <Route path="ai-assistant" element={<AiAssistantPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
