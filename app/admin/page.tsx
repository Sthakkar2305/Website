"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Save, Upload, Link, Image, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid'

const ADMIN_PASSWORD = "admin@123"

// Matches Catalog.tsx categories
const categories = [
  { value: "all", label: "All Collections" },
  { value: "Ring", label: "Ring" },
  { value: "Necklaces", label: "Necklaces" },
  { value: "Earring", label: "Earring" },
  { value: "Bracelets", label: "Bracelets" },
  { value: "Pendants", label: "Pendants" },
  { value: "Chain", label: "Chain" },
  { value: "Mangalsutra", label: "Mangalsutra" },
];

interface MetalRate {
    gold: number
    silver: number
    lastUpdated: string
}

interface SliderItem {
    id: string
    image: string
    title: string
    subtitle: string
    link: string
    type?: 'image' | 'video'
}

interface Product {
    id: string
    name: string
    category: string
    price: number
    image: string
    metal: string
    purity: string
    weight: string
    inStock: boolean
    type?: 'image' | 'video'
}

export default function AdminPage() {
    const { toast } = useToast()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [passwordInput, setPasswordInput] = useState("")
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(true)

    const [rates, setRates] = useState<MetalRate>({ gold: 6250, silver: 78, lastUpdated: new Date().toISOString() })
    const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
    const [products, setProducts] = useState<Product[]>([])
    
    // Filtering for Admin List View
    const [selectedCategory, setSelectedCategory] = useState("all")
    
    const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
    const [deletingSliderId, setDeletingSliderId] = useState<string | null>(null)

    // State for image handling mode
    const [useSliderImageLink, setUseSliderImageLink] = useState(false)
    const [useProductImageLink, setUseProductImageLink] = useState(false)

    // State for media type
    const [sliderMediaType, setSliderMediaType] = useState<'image' | 'video'>('image')
    const [productMediaType, setProductMediaType] = useState<'image' | 'video'>('image')

    // State for selected file objects
    const [selectedSliderFile, setSelectedSliderFile] = useState<File | null>(null)
    const [selectedProductFile, setSelectedProductFile] = useState<File | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem("admin-auth")
        if (stored === "true") {
            setIsAuthenticated(true)
            setShowPasswordPrompt(false)
            loadData()
        }
    }, [])

    const handlePasswordSubmit = () => {
        if (passwordInput === ADMIN_PASSWORD) {
            localStorage.setItem("admin-auth", "true")
            setIsAuthenticated(true)
            setShowPasswordPrompt(false)
            toast({ title: "Access Granted", description: "Welcome Admin!" })
            loadData()
        } else {
            toast({ title: "Access Denied", description: "Wrong password", variant: "destructive" })
        }
    }

    const loadData = async () => {
        try {
            const ratesResponse = await fetch("/api/admin/rates")
            if (ratesResponse.ok) setRates(await ratesResponse.json())

            const sliderResponse = await fetch("/api/admin/slider")
            if (sliderResponse.ok) setSliderItems(await sliderResponse.json())

            const productsResponse = await fetch("/api/admin/products")
            if (productsResponse.ok) setProducts(await productsResponse.json())
        } catch (error) {
            console.error("Failed to load data:", error)
            toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" })
        }
    }

    const updateRates = async () => {
        try {
            const response = await fetch("/api/admin/rates", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rates),
            })
            if (response.ok) {
                toast({ title: "Success", description: "Metal rates updated successfully" })
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update metal rates");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to update metal rates", variant: "destructive" })
        }
    }

    // --- Slider Item Handlers ---
    const handleSliderImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedSliderFile(e.target.files[0])
            // Clear image link if a file is selected
            if (editingSlider) setEditingSlider({ ...editingSlider, image: "" })
        } else {
            setSelectedSliderFile(null)
        }
    }

    const handleSliderImageLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (editingSlider) {
            setEditingSlider({ ...editingSlider, image: e.target.value })
            setSelectedSliderFile(null) // Clear selected file if link is being used
        }
    }

    const startEditingSlider = (item: SliderItem | null) => {
        setEditingSlider(item)
        setSelectedSliderFile(null) // Clear file selection on new edit
        
        // Determine initial type and mode based on existing media URL
        if (item?.image) {
            if (item.image.match(/\.(mp4|webm|ogg)$/i)) {
                setSliderMediaType('video')
                setUseSliderImageLink(true)
            } else if (!item.image.startsWith('/uploads/')) {
                setUseSliderImageLink(true)
                setSliderMediaType('image')
            } else {
                setUseSliderImageLink(false)
                setSliderMediaType('image')
            }
        } else {
            setUseSliderImageLink(false)
            setSliderMediaType('image')
        }
    }

    const saveSliderItem = async (item: SliderItem) => {
        const formData = new FormData()
        formData.append("title", item.title)
        formData.append("subtitle", item.subtitle)
        formData.append("link", item.link)
        formData.append("type", sliderMediaType)

        // For existing items, ensure ID is present. For new, generate.
        const currentId = item.id || uuidv4();
        formData.append("id", currentId);

        if (selectedSliderFile) {
            formData.append("file", selectedSliderFile)
        } else if (item.image) {
            formData.append("imageLink", item.image) // Send the image link if no file is uploaded
        } else if (item.id === "" && !selectedSliderFile && !item.image) {
             // For a brand new item, if neither file nor link is provided
            toast({ title: "Error", description: "Please provide an image by uploading a file or pasting a link.", variant: "destructive" })
            return;
        }

        try {
            const method = item.id ? "PUT" : "POST"
            const response = await fetch("/api/admin/slider", {
                method,
                body: formData,
            })

            if (response.ok) {
                await loadData()
                setEditingSlider(null)
                setSelectedSliderFile(null)
                setUseSliderImageLink(false) // Reset mode
                setSliderMediaType('image') // Reset type
                toast({ title: "Success", description: `Slider item ${item.id ? "updated" : "created"}` })
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${item.id ? "update" : "create"} slider item`);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to save slider item", variant: "destructive" })
        }
    }

    const deleteSliderItem = async (id: string) => {
        setDeletingSliderId(id)
        try {
            const response = await fetch(`/api/admin/slider?id=${id}`, { method: "DELETE" })
            if (response.ok) {
                await loadData()
                toast({ title: "Success", description: "Slider item deleted successfully" })
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete slider item");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete slider item", variant: "destructive" })
        } finally {
            setDeletingSliderId(null)
        }
    }

    // --- Product Handlers ---
    const handleProductImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedProductFile(e.target.files[0])
            // Clear image link if a file is selected
            if (editingProduct) setEditingProduct({ ...editingProduct, image: "" })
        } else {
            setSelectedProductFile(null)
        }
    }

    const handleProductImageLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (editingProduct) {
            setEditingProduct({ ...editingProduct, image: e.target.value })
            setSelectedProductFile(null) // Clear selected file if link is being used
        }
    }

    const startEditingProduct = (product: Product | null) => {
        setEditingProduct(product)
        setSelectedProductFile(null) // Clear file selection on new edit
        
        // Determine initial type and mode based on existing media URL
        if (product?.image) {
            if (product.image.match(/\.(mp4|webm|ogg)$/i)) {
                setProductMediaType('video')
                setUseProductImageLink(true)
            } else if (!product.image.startsWith('/uploads/')) {
                setUseProductImageLink(true)
                setProductMediaType('image')
            } else {
                setUseProductImageLink(false)
                setProductMediaType('image')
            }
        } else {
            setUseProductImageLink(false)
            setProductMediaType('image')
        }
    }

    const saveProduct = async (product: Product) => {
        const formData = new FormData()
        formData.append("name", product.name)
        formData.append("category", product.category)
        formData.append("price", product.price.toString())
        formData.append("metal", product.metal)
        formData.append("purity", product.purity)
        formData.append("weight", product.weight)
        formData.append("inStock", product.inStock.toString())
        formData.append("type", productMediaType)

        const currentId = product.id || uuidv4();
        formData.append("id", currentId);

        if (selectedProductFile) {
            formData.append("file", selectedProductFile)
        } else if (product.image) {
            formData.append("imageLink", product.image) // Send the image link if no file is uploaded
        } else if (product.id === "" && !selectedProductFile && !product.image) {
            toast({ title: "Error", description: "Please provide an image by uploading a file or pasting a link.", variant: "destructive" })
            return;
        }

        try {
            const method = product.id ? "PUT" : "POST"
            const response = await fetch("/api/admin/products", {
                method,
                body: formData,
            })

            if (response.ok) {
                await loadData()
                setEditingProduct(null)
                setSelectedProductFile(null)
                setUseProductImageLink(false) // Reset mode
                setProductMediaType('image') // Reset type
                toast({ title: "Success", description: `Product ${product.id ? "updated" : "created"}` })
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${product.id ? "update" : "create"} product`);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to save product", variant: "destructive" })
        }
    }

    const deleteProduct = async (id: string) => {
        setDeletingProductId(id)
        try {
            const response = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
            if (response.ok) {
                await loadData()
                toast({ title: "Success", description: "Product deleted successfully" })
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete product");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" })
        } finally {
            setDeletingProductId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "short",
            timeStyle: "medium",
        }).format(new Date(dateString))
    }

    // Helper function to detect media type for display
    const getMediaType = (url: string): 'image' | 'video' => {
        return url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
    }

    // Filter products for the admin view
    const filteredAdminProducts = products.filter(p => {
        if (selectedCategory === "all") return true;
        return p.category === selectedCategory;
    });

    if (showPasswordPrompt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Card className="w-[350px]">
                    <CardHeader><CardTitle>Admin Login</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Enter admin password"
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        />
                        <Button className="w-full" onClick={handlePasswordSubmit}>Submit</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your store</p>

            <Tabs defaultValue="rates" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="rates">Metal Rates</TabsTrigger>
                    <TabsTrigger value="slider">Hero Slider</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>

                {/* Metal Rates */}
                <TabsContent value="rates">
                    <Card>
                        <CardHeader><CardTitle>Update Rates</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Gold Rate (₹/10 gm)</label>
                                    <Input
                                        value={rates.gold}
                                        onChange={(e) => setRates({ ...rates, gold: parseFloat(e.target.value) })}
                                        type="number"
                                    />
                                </div>
                                <div>
                                    <label>Silver Rate (₹/gm)</label>
                                    <Input
                                        value={rates.silver}
                                        onChange={(e) => setRates({ ...rates, silver: parseFloat(e.target.value) })}
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Last updated: {formatDate(rates.lastUpdated)}</p>
                                <Button onClick={updateRates}><Save className="w-4 h-4 mr-2" /> Update Rates</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Hero Slider Section */}
                <TabsContent value="slider">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Slider Items</h2>
                        <Button onClick={() => startEditingSlider({ id: "", image: "", title: "", subtitle: "", link: "" })}>
                            <Plus className="w-4 h-4 mr-2" /> Add Slider
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sliderItems.map((item) => {
                            const mediaType = getMediaType(item.image);
                            return (
                                <Card key={item.id}>
                                    <CardContent className="p-4">
                                        <div className={`mb-2 rounded overflow-hidden ${
                                            mediaType === 'video' 
                                                ? 'aspect-[9/16] h-64' // 9:16 aspect ratio for videos
                                                : 'aspect-video h-40' // 16:9 aspect ratio for images
                                        }`}>
                                            {mediaType === 'video' ? (
                                                <video
                                                    src={item.image}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            )}
                                        </div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" onClick={() => startEditingSlider(item)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => deleteSliderItem(item.id)} disabled={deletingSliderId === item.id}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {editingSlider && (
                        <Card className="mt-6 border border-orange-500">
                            <CardHeader><CardTitle>{editingSlider.id ? "Edit" : "Add"} Slider</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Input placeholder="Title" value={editingSlider.title} onChange={(e) => setEditingSlider({ ...editingSlider, title: e.target.value })} />
                                <Input placeholder="Subtitle" value={editingSlider.subtitle} onChange={(e) => setEditingSlider({ ...editingSlider, subtitle: e.target.value })} />
                                <Input placeholder="Link" value={editingSlider.link} onChange={(e) => setEditingSlider({ ...editingSlider, link: e.target.value })} />

                                {/* Media Upload / Link for Slider */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        {/* Media Type Selection */}
                                        <div className="flex gap-2 mr-4">
                                            <Button
                                                variant={sliderMediaType === 'image' ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSliderMediaType('image')}
                                            >
                                                <Image className="w-4 h-4 mr-2" /> Image
                                            </Button>
                                            <Button
                                                variant={sliderMediaType === 'video' ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSliderMediaType('video')}
                                            >
                                                <Video className="w-4 h-4 mr-2" /> Video
                                            </Button>
                                        </div>
                                        
                                        {/* Upload/Link Selection */}
                                        <Button
                                            variant={useSliderImageLink ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => { 
                                                setUseSliderImageLink(false); 
                                                setSelectedSliderFile(null); 
                                                if(editingSlider) setEditingSlider({...editingSlider, image: editingSlider.image.startsWith('/uploads/') ? editingSlider.image : ""}) 
                                            }}
                                        >
                                            <Upload className="w-4 h-4 mr-2" /> Upload File
                                        </Button>
                                        <Button
                                            variant={useSliderImageLink ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => { setUseSliderImageLink(true); setSelectedSliderFile(null); }}
                                        >
                                            <Link className="w-4 h-4 mr-2" /> Use Link
                                        </Button>
                                    </div>

                                    {useSliderImageLink ? (
                                        <Input
                                            placeholder={sliderMediaType === 'image' ? "Image URL" : "Video URL"}
                                            value={editingSlider.image}
                                            onChange={handleSliderImageLinkChange}
                                        />
                                    ) : (
                                        <Input
                                            id="slider-media-upload"
                                            type="file"
                                            accept={sliderMediaType === 'image' ? "image/*" : "video/*"}
                                            onChange={handleSliderImageFileChange}
                                            className="w-full"
                                        />
                                    )}

                                    {/* Display chosen file name or current link */}
                                    <div className="flex items-center gap-2 mt-2">
                                        {selectedSliderFile && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Upload className="w-3 h-3" /> {selectedSliderFile.name}
                                            </Badge>
                                        )}
                                        {editingSlider.image && !selectedSliderFile && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                Current: {useSliderImageLink ? editingSlider.image : editingSlider.image.split('/').pop()}
                                            </Badge>
                                        )}
                                    </div>
                                    {/* Media Preview */}
                                    {(selectedSliderFile || editingSlider.image) && (
                                        <div className="mt-2">
                                            {sliderMediaType === 'image' ? (
                                                <img
                                                    src={selectedSliderFile ? URL.createObjectURL(selectedSliderFile) : editingSlider.image}
                                                    alt="Preview"
                                                    className="w-32 h-32 object-cover rounded border"
                                                />
                                            ) : (
                                                <video
                                                    src={selectedSliderFile ? URL.createObjectURL(selectedSliderFile) : editingSlider.image}
                                                    className="w-32 h-32 object-cover rounded border"
                                                    controls
                                                    muted
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => saveSliderItem(editingSlider)}><Save className="w-4 h-4 mr-2" /> Save</Button>
                                    <Button variant="outline" onClick={() => { 
                                        setEditingSlider(null); 
                                        setSelectedSliderFile(null); 
                                        setUseSliderImageLink(false); 
                                        setSliderMediaType('image');
                                    }}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Products Section */}
                <TabsContent value="products">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Products</h2>
                        <div className="flex gap-2">
                             {/* Admin Filter Dropdown */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            
                            <Button onClick={() => startEditingProduct({ id: "", name: "", category: "Ring", price: 0, image: "", metal: "", purity: "", weight: "", inStock: true })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAdminProducts.map((product) => {
                            const mediaType = getMediaType(product.image);
                            return (
                                <Card key={product.id}>
                                    <CardContent className="p-4">
                                        <div className={`w-full mb-2 rounded overflow-hidden ${
                                            mediaType === 'video' 
                                                ? 'aspect-[9/16] h-64' // 9:16 aspect ratio for videos
                                                : 'aspect-square h-40' // Square aspect ratio for product images
                                        }`}>
                                            {mediaType === 'video' ? (
                                                <video
                                                    src={product.image}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            )}
                                        </div>
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{product.category} - ₹{product.price}</p>
                                        <p className="text-sm">{product.metal} ({product.purity}), {product.weight}</p>
                                        <Badge className="mt-1" variant={product.inStock ? "default" : "secondary"}>{product.inStock ? "In Stock" : "Out of Stock"}</Badge>
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" onClick={() => startEditingProduct(product)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)} disabled={deletingProductId === product.id}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {editingProduct && (
                        <Card className="mt-6 border border-orange-500">
                            <CardHeader><CardTitle>{editingProduct.id ? "Edit" : "Add"} Product</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="Name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                                    
                                    {/* Edit Category Dropdown */}
                                    <select
                                        value={editingProduct.category}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {categories.filter(c => c.value !== 'all').map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <Input placeholder="Price" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} />
                                    <Input placeholder="Metal" value={editingProduct.metal} onChange={(e) => setEditingProduct({ ...editingProduct, metal: e.target.value })} />
                                    <Input placeholder="Purity" value={editingProduct.purity} onChange={(e) => setEditingProduct({ ...editingProduct, purity: e.target.value })} />
                                    <Input placeholder="Weight" value={editingProduct.weight} onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })} />
                                </div>

                                {/* Media Upload / Link for Product */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        {/* Media Type Selection */}
                                        <div className="flex gap-2 mr-4">
                                            <Button
                                                variant={productMediaType === 'image' ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setProductMediaType('image')}
                                            >
                                                <Image className="w-4 h-4 mr-2" /> Image
                                            </Button>
                                            <Button
                                                variant={productMediaType === 'video' ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setProductMediaType('video')}
                                            >
                                                <Video className="w-4 h-4 mr-2" /> Video
                                            </Button>
                                        </div>
                                        
                                        {/* Upload/Link Selection */}
                                        <Button
                                            variant={useProductImageLink ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => { 
                                                setUseProductImageLink(false); 
                                                setSelectedProductFile(null); 
                                                if(editingProduct) setEditingProduct({...editingProduct, image: editingProduct.image.startsWith('/uploads/') ? editingProduct.image : ""}) 
                                            }}
                                        >
                                            <Upload className="w-4 h-4 mr-2" /> Upload File
                                        </Button>
                                        <Button
                                            variant={useProductImageLink ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => { setUseProductImageLink(true); setSelectedProductFile(null); }}
                                        >
                                            <Link className="w-4 h-4 mr-2" /> Use Link
                                        </Button>
                                    </div>

                                    {useProductImageLink ? (
                                        <Input
                                            placeholder={productMediaType === 'image' ? "Image URL" : "Video URL"}
                                            value={editingProduct.image}
                                            onChange={handleProductImageLinkChange}
                                        />
                                    ) : (
                                        <Input
                                            id="product-media-upload"
                                            type="file"
                                            accept={productMediaType === 'image' ? "image/*" : "video/*"}
                                            onChange={handleProductImageFileChange}
                                            className="w-full"
                                        />
                                    )}

                                    {/* Display chosen file name or current link */}
                                    <div className="flex items-center gap-2 mt-2">
                                        {selectedProductFile && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Upload className="w-3 h-3" /> {selectedProductFile.name}
                                            </Badge>
                                        )}
                                        {editingProduct.image && !selectedProductFile && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                Current: {useProductImageLink ? editingProduct.image : editingProduct.image.split('/').pop()}
                                            </Badge>
                                        )}
                                    </div>
                                    {/* Media Preview */}
                                    {(selectedProductFile || editingProduct.image) && (
                                        <div className="mt-2">
                                            {productMediaType === 'image' ? (
                                                <img
                                                    src={selectedProductFile ? URL.createObjectURL(selectedProductFile) : editingProduct.image}
                                                    alt="Preview"
                                                    className="w-32 h-32 object-cover rounded border"
                                                />
                                            ) : (
                                                <video
                                                    src={selectedProductFile ? URL.createObjectURL(selectedProductFile) : editingProduct.image}
                                                    className="w-32 h-32 object-cover rounded border"
                                                    controls
                                                    muted
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={editingProduct.inStock} onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })} />
                                    <label>In Stock</label>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => saveProduct(editingProduct)}><Save className="w-4 h-4 mr-2" /> Save</Button>
                                    <Button variant="outline" onClick={() => { 
                                        setEditingProduct(null); 
                                        setSelectedProductFile(null); 
                                        setUseProductImageLink(false); 
                                        setProductMediaType('image');
                                    }}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}