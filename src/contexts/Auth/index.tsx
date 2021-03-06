import { createContext, useContext, useState, ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

interface CartProps {
  children: ReactNode;
}

interface UserData {
  email: string;
  password: string;
}

interface UserRegisterData {
  name: string;
  email: string;
  password: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  img: string;
}

interface AuthProviderData {
  authToken: string;
  signIn: (userdata: UserData) => void;
  signUp: (userRegisterdata: UserRegisterData) => void;
  loadProducts: () => void;
  products: Product[];
  Logout: () => void;
  addCart: (toBeAdded: Product) => void;
  removeCart: (toBeDeleted: Product) => void;
  cart: Product[];
  removeAll: () => void;
}

const AuthContext = createContext<AuthProviderData>({} as AuthProviderData);

export const AuthProvider = ({ children }: CartProps) => {
  const history = useHistory();

  // Dessa forma adicionamos ao state o token caso ele exista no localStorage
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState<Product[]>([]);

  const addCart = (toBeAdded: Product) => {
    toast.success("Produto adicionado ao carrinho");
    setCart([...cart, toBeAdded]);
  };

  const removeCart = (toBeDeleted: Product) => {
    toast.error("Produto removido");
    setCart(
      cart.filter((element) => {
        return toBeDeleted.id !== element.id;
      })
    );
  };

  const removeAll = () => {
    toast.error("Produtos removidos");
    setCart([]);
  };

  // Função para logar na aplicação, recebe os dados pegos do form de login
  const signIn = (userData: UserData) => {
    axios
      .post("https://server-hamburgueria-theo.herokuapp.com/login", userData)
      .then((response) => {
        toast.success("Login feito com sucesso !");
        // setamos no localStorage o token, caso tenhamos a resposta esperada
        localStorage.setItem("token", response.data.token);
        // setamos no state o token, caso tenhamos a resposta esperada
        setAuthToken(response.data.token);
        // redirecionamos para a página logado
        history.push("/dashboard");
      })
      .catch((err) => {
        toast.error("Email e/ou senha incorretos");
        console.log(err);
      });
  };

  const signUp = (userRegisterData: UserRegisterData) => {
    axios
      .post(
        "https://server-hamburgueria-theo.herokuapp.com/register",
        userRegisterData
      )
      .then((response) => {
        toast.success("Cadastro feito com sucesso !");
        // redirecionamos para a página logado
        history.push("/");
      })
      .catch((err) => {
        toast.error("Email já cadastrado");
        console.log(err);
      });
  };

  // Função para deslogar da aplicação
  const Logout = () => {
    // limpando o localStorage
    localStorage.clear();
    // limpando o state
    setAuthToken("");
    // redirecionando para login
    history.push("/");
  };

  const loadProducts = () => {
    axios
      .get("https://server-hamburgueria-theo.herokuapp.com/vitrine")
      .then((response) => {
        // alterando o valor de [] para os produtos
        setProducts(response.data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        products,
        addCart,
        cart,
        loadProducts,
        signUp,
        Logout,
        signIn,
        removeCart,
        removeAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
