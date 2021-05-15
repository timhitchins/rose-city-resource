# passport-local-roles


[Passport](http://passportjs.org/) strategy for authenticating with a username, password and User Roles.

This module lets you authenticate using a username,password and user roles in your Node.js
applications.  By plugging into Passport, local authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-local-roles
```

## Usage

#### Configure Strategy

The local authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

```js
passport.use(new LocalStrategy(
  function(username, password, role, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
```

##### Available Options

This strategy takes an optional options hash before the function, e.g. `new LocalStrategy({/* options */, callback})`.

The available options are:

* `usernameField` - Optional, defaults to 'username'
* `passwordField` - Optional, defaults to 'password'
* `roleField` - Optional, defaults to 'default'
All fields define the name of the properties in the POST body that are sent to the server.

#### Parameters

By default, `LocalStrategy` expects to find credentials in parameters
named username and password. If your site prefers to name these fields
differently, options are available to change the defaults.

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'passwd',
        roleField: 'role',
        session: false
      },
      function(username, password, role, done) {
        // ...
      }
    ));

When session support is not necessary, it can be safely disabled by
setting the `session` option to false.

The verify callback can be supplied with the `request` object by setting
the `passReqToCallback` option to true, and changing callback arguments
accordingly.

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'passwd',
        roleField: 'role',
        passReqToCallback: true,
        session: false
      },
      function(req, username, password, role, done) {
        // request object is now first argument
        // ...
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'local'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
```



## Credits

- [Jared Hanson](http://github.com/jaredhanson)
- [Dhyey Moliya](http://github.com/DhyeyMoliya)
- [Dhruman Bhadeshiya](http://github.com/dkbhadeshiya)


## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2015 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
