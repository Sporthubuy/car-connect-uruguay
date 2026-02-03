import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import CarDetail from "./pages/CarDetail";
import Reviews from "./pages/Reviews";
import Community from "./pages/Community";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminGuard } from "./components/admin/AdminGuard";
import { BrandAdminGuard } from "./components/brand-admin/BrandAdminGuard";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminBrandForm from "./pages/admin/AdminBrandForm";
import AdminBrandContacts from "./pages/admin/AdminBrandContacts";
import AdminBrandAdmins from "./pages/admin/AdminBrandAdmins";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCreateUser from "./pages/admin/AdminCreateUser";
import AdminModels from "./pages/admin/AdminModels";
import AdminModelForm from "./pages/admin/AdminModelForm";
import AdminTrims from "./pages/admin/AdminTrims";
import AdminTrimForm from "./pages/admin/AdminTrimForm";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminBenefits from "./pages/admin/AdminBenefits";
import AdminBenefitForm from "./pages/admin/AdminBenefitForm";
import AdminActivations from "./pages/admin/AdminActivations";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminComments from "./pages/admin/AdminComments";
import AdminCommunities from "./pages/admin/AdminCommunities";
import AdminCommunityForm from "./pages/admin/AdminCommunityForm";
import AdminCommunityPosts from "./pages/admin/AdminCommunityPosts";
// Brand admin pages
import BrandAdminDashboard from "./pages/brand-admin/BrandAdminDashboard";
import BrandAdminContacts from "./pages/brand-admin/BrandAdminContacts";
import BrandAdminModels from "./pages/brand-admin/BrandAdminModels";
import BrandAdminModelForm from "./pages/brand-admin/BrandAdminModelForm";
import BrandAdminTrims from "./pages/brand-admin/BrandAdminTrims";
import BrandAdminTrimForm from "./pages/brand-admin/BrandAdminTrimForm";
import BrandAdminLeads from "./pages/brand-admin/BrandAdminLeads";
import BrandAdminEvents from "./pages/brand-admin/BrandAdminEvents";
import BrandAdminEventForm from "./pages/brand-admin/BrandAdminEventForm";
import BrandAdminBenefits from "./pages/brand-admin/BrandAdminBenefits";
import BrandAdminBenefitForm from "./pages/brand-admin/BrandAdminBenefitForm";
import BrandAdminActivations from "./pages/brand-admin/BrandAdminActivations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/autos" element={<Cars />} />
          <Route path="/autos/:id" element={<CarDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/:slug" element={<Reviews />} />
          <Route path="/comunidad" element={<Community />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/brands" element={<AdminGuard><AdminBrands /></AdminGuard>} />
          <Route path="/admin/brands/new" element={<AdminGuard><AdminBrandForm /></AdminGuard>} />
          <Route path="/admin/brands/:brandId" element={<AdminGuard><AdminBrandForm /></AdminGuard>} />
          <Route path="/admin/brands/:brandId/contacts" element={<AdminGuard><AdminBrandContacts /></AdminGuard>} />
          <Route path="/admin/brands/:brandId/admins" element={<AdminGuard><AdminBrandAdmins /></AdminGuard>} />
          <Route path="/admin/models" element={<AdminGuard><AdminModels /></AdminGuard>} />
          <Route path="/admin/models/new" element={<AdminGuard><AdminModelForm /></AdminGuard>} />
          <Route path="/admin/models/:modelId" element={<AdminGuard><AdminModelForm /></AdminGuard>} />
          <Route path="/admin/models/:modelId/trims" element={<AdminGuard><AdminTrims /></AdminGuard>} />
          <Route path="/admin/models/:modelId/trims/new" element={<AdminGuard><AdminTrimForm /></AdminGuard>} />
          <Route path="/admin/trims/:trimId" element={<AdminGuard><AdminTrimForm /></AdminGuard>} />
          <Route path="/admin/leads" element={<AdminGuard><AdminLeads /></AdminGuard>} />
          <Route path="/admin/events" element={<AdminGuard><AdminEvents /></AdminGuard>} />
          <Route path="/admin/events/new" element={<AdminGuard><AdminEventForm /></AdminGuard>} />
          <Route path="/admin/events/:eventId" element={<AdminGuard><AdminEventForm /></AdminGuard>} />
          <Route path="/admin/benefits" element={<AdminGuard><AdminBenefits /></AdminGuard>} />
          <Route path="/admin/benefits/new" element={<AdminGuard><AdminBenefitForm /></AdminGuard>} />
          <Route path="/admin/benefits/:benefitId" element={<AdminGuard><AdminBenefitForm /></AdminGuard>} />
          <Route path="/admin/activations" element={<AdminGuard><AdminActivations /></AdminGuard>} />
          <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
          <Route path="/admin/users/new" element={<AdminGuard><AdminCreateUser /></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><AdminSiteSettings /></AdminGuard>} />
          <Route path="/admin/reviews" element={<AdminGuard><AdminReviews /></AdminGuard>} />
          <Route path="/admin/comments" element={<AdminGuard><AdminComments /></AdminGuard>} />
          <Route path="/admin/communities" element={<AdminGuard><AdminCommunities /></AdminGuard>} />
          <Route path="/admin/communities/new" element={<AdminGuard><AdminCommunityForm /></AdminGuard>} />
          <Route path="/admin/communities/:communityId" element={<AdminGuard><AdminCommunityForm /></AdminGuard>} />
          <Route path="/admin/communities/:communityId/posts" element={<AdminGuard><AdminCommunityPosts /></AdminGuard>} />
          {/* Brand admin routes */}
          <Route path="/marca" element={<BrandAdminGuard><BrandAdminDashboard /></BrandAdminGuard>} />
          <Route path="/marca/contactos" element={<BrandAdminGuard><BrandAdminContacts /></BrandAdminGuard>} />
          <Route path="/marca/modelos" element={<BrandAdminGuard><BrandAdminModels /></BrandAdminGuard>} />
          <Route path="/marca/modelos/new" element={<BrandAdminGuard><BrandAdminModelForm /></BrandAdminGuard>} />
          <Route path="/marca/modelos/:modelId" element={<BrandAdminGuard><BrandAdminModelForm /></BrandAdminGuard>} />
          <Route path="/marca/modelos/:modelId/versiones" element={<BrandAdminGuard><BrandAdminTrims /></BrandAdminGuard>} />
          <Route path="/marca/modelos/:modelId/versiones/new" element={<BrandAdminGuard><BrandAdminTrimForm /></BrandAdminGuard>} />
          <Route path="/marca/versiones/:trimId" element={<BrandAdminGuard><BrandAdminTrimForm /></BrandAdminGuard>} />
          <Route path="/marca/leads" element={<BrandAdminGuard><BrandAdminLeads /></BrandAdminGuard>} />
          <Route path="/marca/eventos" element={<BrandAdminGuard><BrandAdminEvents /></BrandAdminGuard>} />
          <Route path="/marca/eventos/new" element={<BrandAdminGuard><BrandAdminEventForm /></BrandAdminGuard>} />
          <Route path="/marca/eventos/:eventId" element={<BrandAdminGuard><BrandAdminEventForm /></BrandAdminGuard>} />
          <Route path="/marca/beneficios" element={<BrandAdminGuard><BrandAdminBenefits /></BrandAdminGuard>} />
          <Route path="/marca/beneficios/new" element={<BrandAdminGuard><BrandAdminBenefitForm /></BrandAdminGuard>} />
          <Route path="/marca/beneficios/:benefitId" element={<BrandAdminGuard><BrandAdminBenefitForm /></BrandAdminGuard>} />
          <Route path="/marca/activaciones" element={<BrandAdminGuard><BrandAdminActivations /></BrandAdminGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
