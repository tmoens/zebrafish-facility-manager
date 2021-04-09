### Test the server facility (optional)

If you simply deploying the system and not developing code, there is no real need to run the server side automated
tests. If you want to do so, you first need to set up a facility called test, then from the zf-server directory...:

```bash 
export FACILITY=test
npm run test
```

The whole business is rather touchy, but if you have patience it really works a charm.

You need to do a couple of things to set up

1. set up a facility like any other. I choose to call it "test" because I have no imagination.
1. make sure the database is empty (though it is ok to leave the system created admin user in the database)
1. very strange but delete the zf-server/dist directory or stuff just does not work.

After that, I usually run the tests from within WebStorm.  
When you do, you have to set up the FACILITY environment variable.

Also, for some reason, the first time I run tests, it seems to not be able to get started, but thereafter it is fine. No
time to explore right now.


