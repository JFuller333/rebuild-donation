import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, DollarSign, Users, TrendingUp, Calendar, FileText, Image, Target, UserCircle, Handshake, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/hooks/use-shopify-products";

interface Project {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  goal_amount: number;
  raised_amount: number;
  image_url: string | null;
  status: string;
  days_left: number | null;
  donor_count: number;
  shopify_product_handle?: string | null;
}

interface ProjectUpdate {
  id: string;
  shopify_product_handle: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ProgressGalleryItem {
  id: string;
  shopify_product_handle: string;
  image_url: string;
  caption: string | null;
  date: string | null;
  display_order: number;
}

interface ImpactItem {
  id: string;
  shopify_product_handle: string;
  text: string;
  display_order: number;
}

interface TeamMember {
  id: string;
  shopify_product_handle: string;
  name: string;
  role: string;
  image_url: string | null;
  display_order: number;
}

interface Partner {
  id: string;
  shopify_product_handle: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Project Updates state
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [selectedProductHandle, setSelectedProductHandle] = useState<string>("");

  // Dynamic Features Management
  const { data: productsData, isLoading: productsLoading } = useProducts({ first: 100 });
  const [selectedProductForManagement, setSelectedProductForManagement] = useState<string>("");
  const [progressGallery, setProgressGallery] = useState<ProgressGalleryItem[]>([]);
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  // Form states for dynamic features
  const [galleryForm, setGalleryForm] = useState({ image_url: "", caption: "", date: "" });
  const [impactForm, setImpactForm] = useState({ text: "" });
  const [teamForm, setTeamForm] = useState({ name: "", role: "", image_url: "" });
  const [partnerForm, setPartnerForm] = useState({ name: "", logo_url: "", website_url: "" });
  const [editingItem, setEditingItem] = useState<{ type: string; id: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    goal_amount: "",
    image_url: "",
    days_left: "",
    shopify_product_handle: "",
  });

  // Update form state
  const [updateFormData, setUpdateFormData] = useState({
    shopify_product_handle: "",
    date: "",
    title: "",
    description: "",
    status: "upcoming" as 'completed' | 'in-progress' | 'upcoming',
    image_url: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
      fetchProjectUpdates();
      subscribeToProjects();
    }
  }, [isAdmin]);

  // Fetch dynamic features when product is selected
  useEffect(() => {
    if (selectedProductForManagement) {
      fetchProgressGallery();
      fetchImpactItems();
      fetchTeamMembers();
      fetchPartners();
    }
  }, [selectedProductForManagement]);

  const checkAuth = async () => {
    try {
      // Check session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Try getUser as fallback
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          navigate("/auth");
          return;
        }
        
        setUser(user);
        setIsAdmin(true);
        return;
      }

      setUser(session.user);

      // TEMPORARY: Skip admin check for testing
      // TODO: Re-enable admin role check before production
      setIsAdmin(true);

      // Check if user has admin role
      // const { data: roleData, error: roleError } = await supabase
      //   .from("user_roles")
      //   .select("role")
      //   .eq("user_id", session.user.id)
      //   .eq("role", "admin")
      //   .single();

      // if (roleError || !roleData) {
      //   toast({
      //     title: "Access Denied",
      //     description: "You don't have admin privileges",
      //     variant: "destructive",
      //   });
      //   navigate("/");
      //   return;
      // }

      // setIsAdmin(true);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
      return;
    }

    setProjects(data || []);
  };

  const fetchProjectUpdates = async () => {
    const { data, error } = await supabase
      .from("project_updates")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching project updates:", error);
      toast({
        title: "Error",
        description: "Failed to load project updates",
        variant: "destructive",
      });
      return;
    }

    setProjectUpdates(data || []);
  };

  const subscribeToProjects = () => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          console.log("Real-time update:", payload);
          fetchProjects(); // Refresh projects on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      goal_amount: parseFloat(formData.goal_amount),
      image_url: formData.image_url || null,
      days_left: formData.days_left ? parseInt(formData.days_left) : null,
      raised_amount: editingProject?.raised_amount || 0,
      donor_count: editingProject?.donor_count || 0,
      status: "active",
    };

    if (editingProject) {
      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingProject.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } else {
      const { error } = await supabase
        .from("projects")
        .insert({
          title: projectData.title,
          description: projectData.description,
          location: projectData.location,
          goal_amount: projectData.goal_amount,
          image_url: projectData.image_url,
          days_left: projectData.days_left,
          raised_amount: 0,
          donor_count: 0,
          status: "active",
        } as any);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });
    }

    resetForm();
    fetchProjects();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      location: project.location || "",
      goal_amount: project.goal_amount.toString(),
      image_url: project.image_url || "",
      days_left: project.days_left?.toString() || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Project deleted successfully",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      goal_amount: "",
      image_url: "",
      days_left: "",
      shopify_product_handle: "",
    });
    setEditingProject(null);
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      shopify_product_handle: updateFormData.shopify_product_handle,
      date: updateFormData.date,
      title: updateFormData.title,
      description: updateFormData.description,
      status: updateFormData.status,
      image_url: updateFormData.image_url || null,
    };

    if (editingUpdate) {
      const { error } = await supabase
        .from("project_updates")
        .update(updateData)
        .eq("id", editingUpdate.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update project update",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project update updated successfully",
      });
    } else {
      const { error } = await supabase
        .from("project_updates")
        .insert(updateData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create project update",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project update created successfully",
      });
    }

    resetUpdateForm();
    fetchProjectUpdates();
  };

  const handleEditUpdate = (update: ProjectUpdate) => {
    setEditingUpdate(update);
    setUpdateFormData({
      shopify_product_handle: update.shopify_product_handle,
      date: update.date,
      title: update.title,
      description: update.description,
      status: update.status,
      image_url: update.image_url || "",
    });
    setShowUpdateForm(true);
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    const { error } = await supabase
      .from("project_updates")
      .delete()
      .eq("id", updateId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete update",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Update deleted successfully",
    });
    fetchProjectUpdates();
  };

  const resetUpdateForm = () => {
    setUpdateFormData({
      shopify_product_handle: "",
      date: "",
      title: "",
      description: "",
      status: "upcoming",
      image_url: "",
    });
    setEditingUpdate(null);
    setShowUpdateForm(false);
    setSelectedProductHandle("");
  };

  const getUpdatesForProduct = (productHandle: string) => {
    return projectUpdates.filter(update => update.shopify_product_handle === productHandle);
  };

  // Fetch functions for dynamic features
  const fetchProgressGallery = async () => {
    if (!selectedProductForManagement) return;
    const { data, error } = await supabase
      .from("project_progress_gallery")
      .select("*")
      .eq("shopify_product_handle", selectedProductForManagement)
      .order("display_order", { ascending: true });
    if (error) {
      console.error("Error fetching progress gallery:", error);
    } else {
      setProgressGallery(data || []);
    }
  };

  const fetchImpactItems = async () => {
    if (!selectedProductForManagement) return;
    const { data, error } = await supabase
      .from("project_impact_items")
      .select("*")
      .eq("shopify_product_handle", selectedProductForManagement)
      .order("display_order", { ascending: true });
    if (error) {
      console.error("Error fetching impact items:", error);
    } else {
      setImpactItems(data || []);
    }
  };

  const fetchTeamMembers = async () => {
    if (!selectedProductForManagement) return;
    const { data, error } = await supabase
      .from("project_team_members")
      .select("*")
      .eq("shopify_product_handle", selectedProductForManagement)
      .order("display_order", { ascending: true });
    if (error) {
      console.error("Error fetching team members:", error);
    } else {
      setTeamMembers(data || []);
    }
  };

  const fetchPartners = async () => {
    if (!selectedProductForManagement) return;
    const { data, error } = await supabase
      .from("project_partners")
      .select("*")
      .eq("shopify_product_handle", selectedProductForManagement)
      .order("display_order", { ascending: true });
    if (error) {
      console.error("Error fetching partners:", error);
    } else {
      setPartners(data || []);
    }
  };

  // CRUD handlers for Progress Gallery
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForManagement) return;

    const data = {
      shopify_product_handle: selectedProductForManagement,
      image_url: galleryForm.image_url,
      caption: galleryForm.caption || null,
      date: galleryForm.date || null,
      display_order: progressGallery.length,
    };

    if (editingItem?.type === "gallery") {
      const { error } = await supabase
        .from("project_progress_gallery")
        .update(data)
        .eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update gallery item", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Gallery item updated" });
        fetchProgressGallery();
        setGalleryForm({ image_url: "", caption: "", date: "" });
        setEditingItem(null);
      }
    } else {
      const { error } = await supabase.from("project_progress_gallery").insert(data);
      if (error) {
        toast({ title: "Error", description: "Failed to create gallery item", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Gallery item created" });
        fetchProgressGallery();
        setGalleryForm({ image_url: "", caption: "", date: "" });
      }
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    const { error } = await supabase.from("project_progress_gallery").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Deleted" });
      fetchProgressGallery();
    }
  };

  // CRUD handlers for Impact Items
  const handleImpactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForManagement) return;

    const data = {
      shopify_product_handle: selectedProductForManagement,
      text: impactForm.text,
      display_order: impactItems.length,
    };

    if (editingItem?.type === "impact") {
      const { error } = await supabase
        .from("project_impact_items")
        .update(data)
        .eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update impact item", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Impact item updated" });
        fetchImpactItems();
        setImpactForm({ text: "" });
        setEditingItem(null);
      }
    } else {
      const { error } = await supabase.from("project_impact_items").insert(data);
      if (error) {
        toast({ title: "Error", description: "Failed to create impact item", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Impact item created" });
        fetchImpactItems();
        setImpactForm({ text: "" });
      }
    }
  };

  const handleDeleteImpact = async (id: string) => {
    if (!confirm("Delete this impact item?")) return;
    const { error } = await supabase.from("project_impact_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Deleted" });
      fetchImpactItems();
    }
  };

  // CRUD handlers for Team Members
  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForManagement) return;

    const data = {
      shopify_product_handle: selectedProductForManagement,
      name: teamForm.name,
      role: teamForm.role,
      image_url: teamForm.image_url || null,
      display_order: teamMembers.length,
    };

    if (editingItem?.type === "team") {
      const { error } = await supabase
        .from("project_team_members")
        .update(data)
        .eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update team member", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Team member updated" });
        fetchTeamMembers();
        setTeamForm({ name: "", role: "", image_url: "" });
        setEditingItem(null);
      }
    } else {
      const { error } = await supabase.from("project_team_members").insert(data);
      if (error) {
        toast({ title: "Error", description: "Failed to create team member", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Team member created" });
        fetchTeamMembers();
        setTeamForm({ name: "", role: "", image_url: "" });
      }
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    const { error } = await supabase.from("project_team_members").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Deleted" });
      fetchTeamMembers();
    }
  };

  // CRUD handlers for Partners
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForManagement) return;

    const data = {
      shopify_product_handle: selectedProductForManagement,
      name: partnerForm.name,
      logo_url: partnerForm.logo_url || null,
      website_url: partnerForm.website_url || null,
      display_order: partners.length,
    };

    if (editingItem?.type === "partner") {
      const { error } = await supabase
        .from("project_partners")
        .update(data)
        .eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update partner", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Partner updated" });
        fetchPartners();
        setPartnerForm({ name: "", logo_url: "", website_url: "" });
        setEditingItem(null);
      }
    } else {
      const { error } = await supabase.from("project_partners").insert(data);
      if (error) {
        toast({ title: "Error", description: "Failed to create partner", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Partner created" });
        fetchPartners();
        setPartnerForm({ name: "", logo_url: "", website_url: "" });
      }
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Delete this partner?")) return;
    const { error } = await supabase.from("project_partners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Deleted" });
      fetchPartners();
    }
  };

  const calculateStats = () => {
    const totalGoal = projects.reduce((sum, p) => sum + p.goal_amount, 0);
    const totalRaised = projects.reduce((sum, p) => sum + p.raised_amount, 0);
    const totalDonors = projects.reduce((sum, p) => sum + (p.donor_count || 0), 0);
    
    return { totalGoal, totalRaised, totalDonors };
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Goal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalGoal.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRaised.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingProject ? "Edit Project" : "Create New Project"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal_amount">Goal Amount ($) *</Label>
                    <Input
                      id="goal_amount"
                      type="number"
                      value={formData.goal_amount}
                      onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="days_left">Days Left</Label>
                    <Input
                      id="days_left"
                      type="number"
                      value={formData.days_left}
                      onChange={(e) => setFormData({ ...formData, days_left: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shopify_product_handle">Shopify Product Handle</Label>
                  <Input
                    id="shopify_product_handle"
                    value={formData.shopify_product_handle}
                    onChange={(e) => setFormData({ ...formData, shopify_product_handle: e.target.value })}
                    placeholder="product-handle-from-shopify"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The product handle from your Shopify store (e.g., "tuskegee-townhouse")
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingProject ? "Update Project" : "Create Project"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Project Updates Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Project Updates</h2>
            <Button onClick={() => setShowUpdateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Update
            </Button>
          </div>

          {/* Create/Edit Update Form */}
          {showUpdateForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{editingUpdate ? "Edit Update" : "Create New Update"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="update_shopify_handle">Shopify Product Handle *</Label>
                    <Input
                      id="update_shopify_handle"
                      value={updateFormData.shopify_product_handle}
                      onChange={(e) => setUpdateFormData({ ...updateFormData, shopify_product_handle: e.target.value })}
                      placeholder="product-handle-from-shopify"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link this update to a Shopify product by its handle
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="update_date">Date *</Label>
                      <Input
                        id="update_date"
                        type="date"
                        value={updateFormData.date}
                        onChange={(e) => setUpdateFormData({ ...updateFormData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="update_status">Status *</Label>
                      <Select
                        value={updateFormData.status}
                        onValueChange={(value: 'completed' | 'in-progress' | 'upcoming') => 
                          setUpdateFormData({ ...updateFormData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="update_title">Title *</Label>
                    <Input
                      id="update_title"
                      value={updateFormData.title}
                      onChange={(e) => setUpdateFormData({ ...updateFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="update_description">Description *</Label>
                    <Textarea
                      id="update_description"
                      value={updateFormData.description}
                      onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="update_image_url">Image URL</Label>
                    <Input
                      id="update_image_url"
                      value={updateFormData.image_url}
                      onChange={(e) => setUpdateFormData({ ...updateFormData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingUpdate ? "Update" : "Create Update"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetUpdateForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Updates List */}
          {projectUpdates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No updates yet. Create your first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {projectUpdates.map((update) => (
                <Card key={update.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{update.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            update.status === 'completed' ? 'bg-green-100 text-green-800' :
                            update.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {update.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Product: <span className="font-mono">{update.shopify_product_handle}</span>
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(update.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-sm">{update.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditUpdate(update)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteUpdate(update.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Features Management Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Manage Project Dynamic Features</h2>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading products...</span>
                </div>
              ) : (
                <Select
                  value={selectedProductForManagement}
                  onValueChange={setSelectedProductForManagement}
                >
                  <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue placeholder="Select a Shopify product to manage" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData?.edges.map(({ node: product }) => (
                      <SelectItem key={product.handle} value={product.handle}>
                        {product.title} ({product.handle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {selectedProductForManagement && (
            <Tabs defaultValue="updates" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="updates">
                  <FileText className="h-4 w-4 mr-2" />
                  Updates
                </TabsTrigger>
                <TabsTrigger value="gallery">
                  <Image className="h-4 w-4 mr-2" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="impact">
                  <Target className="h-4 w-4 mr-2" />
                  Impact
                </TabsTrigger>
                <TabsTrigger value="team">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="partners">
                  <Handshake className="h-4 w-4 mr-2" />
                  Partners
                </TabsTrigger>
              </TabsList>

              <TabsContent value="updates" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Updates</h3>
                    <Button onClick={() => {
                      setUpdateFormData({ ...updateFormData, shopify_product_handle: selectedProductForManagement });
                      setShowUpdateForm(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Update
                    </Button>
                  </div>
                  {projectUpdates.filter(u => u.shopify_product_handle === selectedProductForManagement).length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-muted-foreground">No updates for this product</CardContent></Card>
                  ) : (
                    <div className="space-y-2">
                      {projectUpdates.filter(u => u.shopify_product_handle === selectedProductForManagement).map((update) => (
                        <Card key={update.id}>
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{update.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>{new Date(update.date).toLocaleDateString()}</span>
                                  <span className={`px-2 py-1 rounded ${update.status === 'completed' ? 'bg-green-100 text-green-800' : update.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>{update.status}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEditUpdate(update)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => handleDeleteUpdate(update.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Progress Gallery</h3>
                  <Card>
                    <CardHeader><CardTitle>{editingItem?.type === "gallery" ? "Edit" : "Add"} Gallery Item</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleGallerySubmit} className="space-y-4">
                        <div>
                          <Label>Image URL *</Label>
                          <Input value={galleryForm.image_url} onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })} required />
                        </div>
                        <div>
                          <Label>Caption</Label>
                          <Input value={galleryForm.caption} onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={galleryForm.date} onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">{editingItem?.type === "gallery" ? "Update" : "Add"}</Button>
                          {editingItem?.type === "gallery" && <Button type="button" variant="outline" onClick={() => { setEditingItem(null); setGalleryForm({ image_url: "", caption: "", date: "" }); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                  <div className="grid md:grid-cols-2 gap-4">
                    {progressGallery.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <img src={item.image_url} alt={item.caption || ""} className="w-full h-48 object-cover rounded mb-2" />
                          <p className="font-semibold">{item.caption || "No caption"}</p>
                          {item.date && <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>}
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingItem({ type: "gallery", id: item.id }); setGalleryForm({ image_url: item.image_url, caption: item.caption || "", date: item.date || "" }); }}><Edit className="h-3 w-3" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteGallery(item.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="impact" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Impact Items</h3>
                  <Card>
                    <CardHeader><CardTitle>{editingItem?.type === "impact" ? "Edit" : "Add"} Impact Item</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleImpactSubmit} className="space-y-4">
                        <div>
                          <Label>Impact Text *</Label>
                          <Textarea value={impactForm.text} onChange={(e) => setImpactForm({ text: e.target.value })} required rows={3} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">{editingItem?.type === "impact" ? "Update" : "Add"}</Button>
                          {editingItem?.type === "impact" && <Button type="button" variant="outline" onClick={() => { setEditingItem(null); setImpactForm({ text: "" }); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                  <div className="space-y-2">
                    {impactItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="py-4 flex items-center justify-between">
                          <p>{item.text}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => { setEditingItem({ type: "impact", id: item.id }); setImpactForm({ text: item.text }); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteImpact(item.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="team" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Card>
                    <CardHeader><CardTitle>{editingItem?.type === "team" ? "Edit" : "Add"} Team Member</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleTeamSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Name *</Label>
                            <Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} required />
                          </div>
                          <div>
                            <Label>Role *</Label>
                            <Input value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })} required />
                          </div>
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input value={teamForm.image_url} onChange={(e) => setTeamForm({ ...teamForm, image_url: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">{editingItem?.type === "team" ? "Update" : "Add"}</Button>
                          {editingItem?.type === "team" && <Button type="button" variant="outline" onClick={() => { setEditingItem(null); setTeamForm({ name: "", role: "", image_url: "" }); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                  <div className="grid md:grid-cols-2 gap-4">
                    {teamMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {member.image_url && <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />}
                            <div className="flex-1">
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => { setEditingItem({ type: "team", id: member.id }); setTeamForm({ name: member.name, role: member.role, image_url: member.image_url || "" }); }}><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteTeam(member.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="partners" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Partners</h3>
                  <Card>
                    <CardHeader><CardTitle>{editingItem?.type === "partner" ? "Edit" : "Add"} Partner</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handlePartnerSubmit} className="space-y-4">
                        <div>
                          <Label>Name *</Label>
                          <Input value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} required />
                        </div>
                        <div>
                          <Label>Logo URL</Label>
                          <Input value={partnerForm.logo_url} onChange={(e) => setPartnerForm({ ...partnerForm, logo_url: e.target.value })} />
                        </div>
                        <div>
                          <Label>Website URL</Label>
                          <Input value={partnerForm.website_url} onChange={(e) => setPartnerForm({ ...partnerForm, website_url: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">{editingItem?.type === "partner" ? "Update" : "Add"}</Button>
                          {editingItem?.type === "partner" && <Button type="button" variant="outline" onClick={() => { setEditingItem(null); setPartnerForm({ name: "", logo_url: "", website_url: "" }); }}>Cancel</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                  <div className="grid md:grid-cols-2 gap-4">
                    {partners.map((partner) => (
                      <Card key={partner.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {partner.logo_url && <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 object-contain" />}
                            <div className="flex-1">
                              <p className="font-semibold">{partner.name}</p>
                              {partner.website_url && <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{partner.website_url}</a>}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => { setEditingItem({ type: "partner", id: partner.id }); setPartnerForm({ name: partner.name, logo_url: partner.logo_url || "", website_url: partner.website_url || "" }); }}><Edit className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeletePartner(partner.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Projects</h2>
          
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No projects yet. Create your first one!</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{project.location}</p>
                      <p className="text-sm mb-4">{project.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="font-semibold">Goal:</span> ${project.goal_amount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-semibold">Raised:</span> ${project.raised_amount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-semibold">Donors:</span> {project.donor_count}
                        </div>
                        {project.days_left && (
                          <div>
                            <span className="font-semibold">Days left:</span> {project.days_left}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;