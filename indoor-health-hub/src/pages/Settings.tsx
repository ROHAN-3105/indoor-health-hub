import React from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Mail, Calendar, Shield, LogOut } from "lucide-react";

const Settings = () => {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        full_name: "",
        email: "",
        avatar: "",
    });
    const [isLoading, setIsLoading] = React.useState(false);

    // Sync user data to form when user loads or edit starts
    React.useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                email: user.email || "",
                avatar: user.avatar || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const storedToken = localStorage.getItem("token");
            // 1. Try to update backend (Name/Email)
            const res = await fetch("http://localhost:8000/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${storedToken}`
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    email: formData.email
                })
            });

            // 2. Update local context (Avatar + rest)
            updateProfile({
                full_name: formData.full_name,
                email: formData.email,
                avatar: formData.avatar
            });

            if (res.ok) {
                // Success
            }
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-primary" /> Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your profile and account preferences
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                    {/* Sidebar / Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="glass-card rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                            <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20 shadow-glow transition-transform duration-500 group-hover:scale-105">
                                <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold font-display">{user?.username}</h2>
                                <p className="text-sm text-muted-foreground">Premium Member</p>
                            </div>

                            {/* Avatar Selection (Only in Edit Mode) */}
                            {isEditing && (
                                <div className="grid grid-cols-4 gap-2 pt-2 pb-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <button
                                            key={i}
                                            onClick={() => setFormData({ ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}${i}` })}
                                            className="relative rounded-full overflow-hidden hover:ring-2 ring-primary transition-all"
                                        >
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}${i}`} alt="Avatar option" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!isEditing ? (
                                <Button className="w-full gradient-primary shadow-glow hover:opacity-90 active:scale-95 transition-all" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Or paste custom image URL"
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        className="text-xs bg-background/50"
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSave} disabled={isLoading}>
                                            {isLoading ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </Button>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Personal Details */}
                        <Card className="glass-card border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Personal Details
                                </CardTitle>
                                <CardDescription>
                                    Your public profile information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={user?.username || ""} readOnly className="pl-9 bg-muted/50" />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="Not set"
                                        value={isEditing ? formData.full_name : (user?.full_name || "")}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/50" : ""}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Not set"
                                            value={isEditing ? formData.email : (user?.email || "")}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "pl-9 bg-muted/50" : "pl-9"}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Info */}
                        <Card className="glass-card border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" /> Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Member Since</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={formatDate(user?.created_at)} readOnly className="pl-9 bg-muted/50" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
