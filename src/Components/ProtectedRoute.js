import React from "react";
import { Route, Redirect } from "react-router-dom";

export default function ProtectedRoute({component: Component, ...props}){
    return(
        <Route>{
            () => props.isLogin ? <Component {...props}/> : <Redirect to="/signin"/>
        }
        </Route>
    )
}