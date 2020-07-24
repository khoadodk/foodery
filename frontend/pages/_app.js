import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import Cookie from 'js-cookie';
import fetch from 'isomorphic-fetch';

import Layout from '../components/Layout';
import withData from '../lib/apollo';
import AppContext from '../context/AppContext';

class MyApp extends App {
  constructor(props) {
    super(props);
    this.state = { user: null, cart: { items: [], total: 0 } };
  }

  componentDidMount() {
    const token = Cookie.get('token');
    // restore cart from cookie, this could also be tracked in a db
    const cart = Cookie.getJSON('cart');
    console.log(cart);
    //if items in cart, set items and total from cookie
    if (typeof cart === 'object' && cart !== 'undefined') {
      this.setCart(cart);
    }

    if (token) {
      // authenticate the token on the server and place set user object
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(async (res) => {
        // if res comes back not valid, token is not valid
        // delete the token and log the user out on client
        if (!res.ok) {
          Cookie.remove('token');
          this.setState({ user: null });
          return null;
        }
        const user = await res.json();
        this.setUser(user);
      });
    }
  }

  setCart = (cart) => {
    const total = cart
      .map((item) => {
        return item.price * item.quantity;
      })
      .reduce((acc, index) => acc + index);
    this.setState({ cart: { items: cart, total } });
  };

  setUser = (user) => {
    this.setState({ user });
  };

  addItem = (item) => {
    let { items } = this.state.cart;
    // Check for item already in cart
    // If not, add item, else increase quantity by 1
    const newItem = items.find((i) => i.id === item.id);
    if (!newItem) {
      item.quantity = 1;
      this.setState(
        {
          cart: {
            items: [...items, item],
            total: this.state.cart.total + item.price
          }
        },
        () => Cookie.set('cart', JSON.stringify(this.state.cart.items))
      );
    } else {
      this.setState(
        {
          cart: {
            items: this.state.cart.items.map((item) =>
              item.id === newItem.id
                ? Object.assign({}, item, { quantity: item.quantity + 1 })
                : item
            ),
            total: this.state.cart.total + item.price
          }
        },
        () => Cookie.set('cart', JSON.stringify(this.state.cart.items))
      );
    }
  };

  removeItem = (item) => {
    let { items } = this.state.cart;
    //check for item already in cart
    //if in cart, reduce quantity by 1, else remove from cart
    const newItem = items.find((i) => i.id === item.id);
    if (newItem.quantity > 1) {
      this.setState(
        {
          cart: {
            items: this.state.cart.items.map((item) =>
              item.id === newItem.id
                ? Object.assign({}, item, { quantity: item.quantity - 1 })
                : item
            ),
            total: this.state.cart.total - item.price
          }
        },
        () => Cookie.set('cart', JSON.stringify(this.state.cart.items))
      );
    } else {
      const items = [...this.state.cart.items];
      const index = items.findIndex((i) => i.id === newItem.id);

      items.splice(index, 1);
      this.setState(
        { cart: { items: items, total: this.state.cart.total - item.price } },
        () => Cookie.set('cart', JSON.stringify(this.state.cart.items))
      );
    }
  };

  render() {
    const { Component, pageProps } = this.props;
    return (
      <AppContext.Provider
        value={{
          user: this.state.user,
          isAuthenticated: !!this.state.user,
          setUser: this.setUser,
          cart: this.state.cart,
          addItem: this.addItem,
          removeItem: this.removeItem
        }}>
        <Head>
          <link
            rel='stylesheet'
            href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'
            integrity='sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm'
            crossOrigin='anonymous'
          />
        </Head>

        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppContext.Provider>
    );
  }
}

export default withData(MyApp);
