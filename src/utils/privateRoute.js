import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticated } from "./auth"; // đường dẫn đúng tới file auth.js của bạn

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(props) =>
            isAuthenticated() ? (
                <Component {...props} />
            ) : (
                <Redirect to="/authentication/sign-in" />
            )
        }
    />
);

export default PrivateRoute;
