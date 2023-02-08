// small .scd script that parses input and opens the help browser!
(
    var args = thisProcess.argv;
    args.postln;
    if (args.size == 0,
        { HelpBrowser.instance; },
        { HelpBrowser.openHelpFor(args[0]); }
    );
)