# attack navigator map


## installation

depends on `trespass.js` being `npm link`ed:

```
npm link trespass.js
```

install all dependencies:

```
npm install
bower install
```



## development

```
gulp serve
```

- will start a production server at [http://localhost:3000/](http://localhost:3000/)
- make sure the `knowledgebase` is running


## production build

```
gulp build
```

`./dist` will contain the production build.
