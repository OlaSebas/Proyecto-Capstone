import { ShoppingCart, Package, UserPlus } from "lucide-react";

export default function Home() {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center p-6 bg-white shadow-md">
                    <h2 className="text-3xl font-bold text-gray-800">Bienvenido al Sistema</h2>
                </header>
                {/* Subtítulo */}
                <div className="flex justify-center items-center mt-6 px-4">
                    <p className="text-gray-700 text-lg text-center max-w-2xl">
                        Administre las ventas, el inventario, y revise los pedidos a proveedores
                    </p>
                </div>

                {/* Opciones principales (estilo igual a productos) */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Opción Ventas */}
                        <div className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black">
                            <ShoppingCart className="w-16 h-16 mb-4 text-gray-700" />
                            <p className="font-medium">Ventas</p>
                        </div>

                        {/* Opción Inventario */}
                        <div className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black">
                            <Package className="w-16 h-16 mb-4 text-gray-700" />
                            <p className="font-medium">Inventario</p>
                        </div>

                        {/* Opción Proveedores */}
                        <div className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black">
                            <UserPlus className="w-16 h-16 mb-4 text-gray-700" />
                            <p className="font-medium">Proveedores</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}