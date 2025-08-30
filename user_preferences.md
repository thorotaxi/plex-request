# User Preferences

## Terminal Interaction Preferences

### Background Process Handling
- **Preference**: Always use `Start-Process` with `-WindowStyle Hidden` for background server processes
- **Reason**: Prevents chat interface from "hanging" during long-running processes
- **Implementation**: 
  - Use `Start-Process` for servers (npm start, node server.js, etc.)
  - Immediately acknowledge successful startup
  - Provide clear status updates
  - Test services to confirm they're working
  - Continue conversation without waiting for "completion"

### Command Execution Strategy
- **Quick Commands**: Run directly with immediate feedback
- **Background Services**: Use `Start-Process` and acknowledge immediately
- **Long-running Tasks**: Provide progress updates and estimated completion times

### Communication Preferences
- **Status Updates**: Always provide clear feedback when commands complete
- **Error Handling**: Explain what went wrong and how to fix it
- **Success Confirmation**: Explicitly acknowledge when services are ready

## Technical Preferences

### Development Environment
- **Shell**: PowerShell (Windows)
- **Package Manager**: npm
- **Background Process Management**: Use PowerShell `Start-Process` for servers

### UX Feedback
- **Progress Indication**: Provide clear status for long operations
- **Immediate Acknowledgment**: Don't wait for background processes to "complete"
- **Service Testing**: Verify services are working after startup

## Deployment Awareness Preferences

### Schema and Database Changes
- **CRITICAL**: Always provide explicit heads-up when making changes that affect deployment
- **Schema Changes**: Alert user immediately when database schema is modified
- **API Changes**: Notify when API endpoints are added, modified, or removed
- **Configuration Changes**: Flag when environment variables or config files change
- **Dependency Changes**: Warn when package.json dependencies are modified

### Deployment Impact Assessment
- **Before Making Changes**: Consider if changes will complicate redeployment
- **Data Migration**: Alert when data migration might be needed
- **Breaking Changes**: Explicitly warn about any breaking changes
- **Backup Requirements**: Remind about backup needs for production data

### Communication Protocol
- **Explicit Warnings**: Use clear language like "⚠️ DEPLOYMENT IMPACT" or "🚨 SCHEMA CHANGE"
- **Explanation**: Always explain why the change is needed and its impact
- **Options**: Provide alternatives when possible
- **Timing**: Flag changes that require coordinated deployment timing

## Notes
- User has experienced issues with chat interface appearing to "hang" during background processes
- Solution is to use appropriate PowerShell commands and immediate acknowledgment
- This preference should be applied to all future terminal interactions
- **NEW**: User is doing rapid development with minimal direct code changes
- **NEW**: Schema and deployment changes may not be immediately obvious to user
- **NEW**: Always err on the side of over-communication about deployment impacts

