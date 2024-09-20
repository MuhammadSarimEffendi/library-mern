import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; 
import { Checkbox } from "@/components/ui/checkbox"; 
import { fetchUsers, fetchUserById, createUser, updateUser, deleteUser } from '@/features/users/userThunks';
import { clearSelectedUser } from '@/features/users/userSlice';
import { jwtDecode } from "jwt-decode";

const roleOptions = ["admin", "author", "reader"];

const generateRandomPassword = (length = 12) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export default function UserManagement() {
    const dispatch = useDispatch();
    const { items: users, selectedUser, loading, error } = useSelector((state) => state.users);
    
    const [newUser, setNewUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Fetch all users on mount
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken?.role?.includes("admin")) {
                setUserRoles(decodedToken?.role || []);
                setCurrentUserId(decodedToken?._id);
            }
        }
    }, []);

    const handleCreateUser = async () => {
        try {
            await dispatch(createUser({
                ...newUser,
                role: newUser.role,
                password: newUser.password,
            }));
            setNewUser(null);
        } catch (error) {
            console.error("Failed to create user:", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            await dispatch(updateUser({ id: editingUser._id, user: editingUser }));
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await dispatch(deleteUser(userId));
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const handleEditUser = async (userId) => {
        try {
            await dispatch(fetchUserById(userId));
            setEditingUser(selectedUser);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        }
    };

    const openAddUserModal = () => {
        const randomPassword = generateRandomPassword();
        setNewUser({
            username: "",
            email: "",
            password: randomPassword,
            role: [],
        });
    };

    const toggleRole = (role, user, setUser) => {
        const newRoles = user.role.includes(role)
            ? user.role.filter((r) => r !== role)
            : [...user.role, role];
        setUser({ ...user, role: newRoles });
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
                {userRoles.includes("admin") && <Button onClick={openAddUserModal}>Add User</Button>}
            </header>

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : users.length === 0 ? (
                    <p>No users found</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role?.includes("admin") ? "primary" : user.role?.includes("reader") ? "secondary" : "muted"}>
                                            {user.role ? user.role.join(", ") : "No roles"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {userRoles.includes("admin") && (
                                                <>
                                                    <Button variant="outline" size="icon" onClick={() => handleEditUser(user._id)}>
                                                        <FilePenIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleDeleteUser(user._id)}>
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md h-[80vh] overflow-auto">
                                <h2 className="text-xl font-bold mb-4">Edit User</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={editingUser.username}
                                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Roles</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline">
                                                    {editingUser.role?.length > 0
                                                        ? editingUser.role.join(", ")
                                                        : "Select roles"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                {roleOptions.map((role) => (
                                                    <div key={role} className="flex items-center gap-2 py-1">
                                                        <Checkbox
                                                            checked={editingUser.role?.includes(role)}
                                                            onCheckedChange={() => toggleRole(role, editingUser, setEditingUser)}
                                                        />
                                                        <Label>{role}</Label>
                                                    </div>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpdateUser}>Save</Button>
                                </div>
                            </div>
                        </div>
                    </SheetTrigger>
                </Sheet>
            )}

            {/* Add New User Modal */}
            {newUser && (
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md h-[80vh] overflow-auto">
                                <h2 className="text-xl font-bold mb-4">Add User</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password (Auto-generated)</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            value={newUser.password}
                                            readOnly
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Roles</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline">
                                                    {newUser.role.length > 0
                                                        ? newUser.role.join(", ")
                                                        : "Select roles"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                {roleOptions.map((role) => (
                                                    <div key={role} className="flex items-center gap-2 py-1">
                                                        <Checkbox
                                                            checked={newUser.role.includes(role)}
                                                            onCheckedChange={() => toggleRole(role, newUser, setNewUser)}
                                                        />
                                                        <Label>{role}</Label>
                                                    </div>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setNewUser(null)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateUser}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </SheetTrigger>
                </Sheet>
            )}
        </div>
    );
}

function FilePenIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 20h9" />
            <path d="M12 20v-6" />
            <path d="M3 12h15v-9h-9a2 2 0 0 0-2 2v7" />
        </svg>
    );
}

function TrashIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M4 6v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    );
}
