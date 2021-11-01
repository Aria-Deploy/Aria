"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExistingStack = void 0;
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const cfninc = require("@aws-cdk/cloudformation-include");
const js_yaml = require("js-yaml");
const fs = require("fs");
const stackApp_1 = require("./stackApp");
class ExistingStack extends stackApp_1.StackApp {
    constructor(id, props) {
        super(id, props);
        const config = {
            credentials: {
                accessKeyId: "AKIA25JBDPC2IV4DJ6HD",
                secretAccessKey: "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",
            },
            region: "us-west-2",
        };
        (async () => {
            const client = new client_cloudformation_1.CloudFormationClient(config);
            const fetchActiveListsCmd = new client_cloudformation_1.ListStacksCommand({});
            const allUserStacks = await client.send(fetchActiveListsCmd);
            const activeStacks = allUserStacks.StackSummaries?.filter((stack) => !stack.DeletionTime);
            // USER-INPUT: Replace with User Required Selection from Stacks
            const stackId = activeStacks ? activeStacks[0].StackId : "";
            const stackName = activeStacks ? activeStacks[0].StackName : "";
            const fetchStackTemplateCmd = new client_cloudformation_1.GetTemplateCommand({
                StackName: stackId,
            });
            const existingStackTemplate = await client.send(fetchStackTemplateCmd);
            const obj = js_yaml.load(existingStackTemplate.TemplateBody || "");
            fs.writeFileSync("./cdk.out/existingStackTemplate.json", JSON.stringify(obj, null, 2));
            const template = new cfninc.CfnInclude(this, stackName || "", {
                templateFile: "./cdk.out/existingStackTemplate.json",
            });
        })();
        // const importStack = Stack.
    }
}
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0RXhpc3RpbmdTdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltcG9ydEV4aXN0aW5nU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMEVBSXdDO0FBQ3hDLDBEQUEwRDtBQUMxRCxtQ0FBbUM7QUFDbkMseUJBQXlCO0FBRXpCLHlDQUFzQztBQUV0QyxNQUFhLGFBQWMsU0FBUSxtQkFBUTtJQUN6QyxZQUFZLEVBQVUsRUFBRSxLQUFzQjtRQUM1QyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWpCLE1BQU0sTUFBTSxHQUFHO1lBQ2IsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxzQkFBc0I7Z0JBQ25DLGVBQWUsRUFBRSwwQ0FBMEM7YUFDNUQ7WUFDRCxNQUFNLEVBQUUsV0FBVztTQUNwQixDQUFDO1FBQ0YsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNWLE1BQU0sTUFBTSxHQUFHLElBQUksNENBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLHlDQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzdELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUN2RCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUMvQixDQUFDO1lBRUYsK0RBQStEO1lBQy9ELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzVELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSwwQ0FBa0IsQ0FBQztnQkFDbkQsU0FBUyxFQUFFLE9BQU87YUFDbkIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUV2RSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNuRSxFQUFFLENBQUMsYUFBYSxDQUNkLHNDQUFzQyxFQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQzdCLENBQUM7WUFDRixNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsSUFBSSxFQUFFLEVBQUU7Z0JBQzVELFlBQVksRUFBRSxzQ0FBc0M7YUFDckQsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVMLDZCQUE2QjtJQUMvQixDQUFDO0NBQ0Y7QUF2Q0Qsc0NBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQge1xuICBDbG91ZEZvcm1hdGlvbkNsaWVudCxcbiAgTGlzdFN0YWNrc0NvbW1hbmQsXG4gIEdldFRlbXBsYXRlQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvblwiO1xuaW1wb3J0ICogYXMgY2ZuaW5jIGZyb20gXCJAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1pbmNsdWRlXCI7XG5pbXBvcnQgKiBhcyBqc195YW1sIGZyb20gXCJqcy15YW1sXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcblxuaW1wb3J0IHsgU3RhY2tBcHAgfSBmcm9tIFwiLi9zdGFja0FwcFwiO1xuXG5leHBvcnQgY2xhc3MgRXhpc3RpbmdTdGFjayBleHRlbmRzIFN0YWNrQXBwIHtcbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBhY2Nlc3NLZXlJZDogXCJBS0lBMjVKQkRQQzJJVjRESjZIRFwiLFxuICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IFwiNFZXcmYrelVhWlBOWEFzRzdnbExpMnVWcW5sZnByeUM4eEhiakJtdVwiLFxuICAgICAgfSxcbiAgICAgIHJlZ2lvbjogXCJ1cy13ZXN0LTJcIixcbiAgICB9O1xuICAgIChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xvdWRGb3JtYXRpb25DbGllbnQoY29uZmlnKTtcbiAgICAgIGNvbnN0IGZldGNoQWN0aXZlTGlzdHNDbWQgPSBuZXcgTGlzdFN0YWNrc0NvbW1hbmQoe30pO1xuICAgICAgY29uc3QgYWxsVXNlclN0YWNrcyA9IGF3YWl0IGNsaWVudC5zZW5kKGZldGNoQWN0aXZlTGlzdHNDbWQpO1xuICAgICAgY29uc3QgYWN0aXZlU3RhY2tzID0gYWxsVXNlclN0YWNrcy5TdGFja1N1bW1hcmllcz8uZmlsdGVyKFxuICAgICAgICAoc3RhY2spID0+ICFzdGFjay5EZWxldGlvblRpbWVcbiAgICAgICk7XG5cbiAgICAgIC8vIFVTRVItSU5QVVQ6IFJlcGxhY2Ugd2l0aCBVc2VyIFJlcXVpcmVkIFNlbGVjdGlvbiBmcm9tIFN0YWNrc1xuICAgICAgY29uc3Qgc3RhY2tJZCA9IGFjdGl2ZVN0YWNrcyA/IGFjdGl2ZVN0YWNrc1swXS5TdGFja0lkIDogXCJcIjtcbiAgICAgIGNvbnN0IHN0YWNrTmFtZSA9IGFjdGl2ZVN0YWNrcyA/IGFjdGl2ZVN0YWNrc1swXS5TdGFja05hbWUgOiBcIlwiO1xuICAgICAgY29uc3QgZmV0Y2hTdGFja1RlbXBsYXRlQ21kID0gbmV3IEdldFRlbXBsYXRlQ29tbWFuZCh7XG4gICAgICAgIFN0YWNrTmFtZTogc3RhY2tJZCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZXhpc3RpbmdTdGFja1RlbXBsYXRlID0gYXdhaXQgY2xpZW50LnNlbmQoZmV0Y2hTdGFja1RlbXBsYXRlQ21kKTtcblxuICAgICAgY29uc3Qgb2JqID0ganNfeWFtbC5sb2FkKGV4aXN0aW5nU3RhY2tUZW1wbGF0ZS5UZW1wbGF0ZUJvZHkgfHwgXCJcIik7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICBcIi4vY2RrLm91dC9leGlzdGluZ1N0YWNrVGVtcGxhdGUuanNvblwiLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDIpXG4gICAgICApO1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSBuZXcgY2ZuaW5jLkNmbkluY2x1ZGUodGhpcywgc3RhY2tOYW1lIHx8IFwiXCIsIHtcbiAgICAgICAgdGVtcGxhdGVGaWxlOiBcIi4vY2RrLm91dC9leGlzdGluZ1N0YWNrVGVtcGxhdGUuanNvblwiLFxuICAgICAgfSk7XG4gICAgfSkoKTtcblxuICAgIC8vIGNvbnN0IGltcG9ydFN0YWNrID0gU3RhY2suXG4gIH1cbn1cbiJdfQ==