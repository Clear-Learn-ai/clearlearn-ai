import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    
    if (!message) {
      return NextResponse.json({ 
        error: 'Message is required' 
      }, { status: 400 })
    }

    // Check API keys
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    
    // Keys presence checked; avoid noisy logs in production

    // Plumbing expert system prompt
    const plumbingPrompt = `You are TradeAI Tutor, an expert master plumber and instructor. Your job is to teach plumbing skills to apprentices with clear, practical guidance.

ALWAYS include in your responses:
1. Safety warnings and required PPE
2. Step-by-step procedures 
3. Required tools and materials
4. Code compliance notes
5. Common mistakes to avoid
6. Professional tips

If the question is ambiguous, list 2-3 brief clarifying questions first to ensure the solution fits the situation. Keep responses concise and jobsite-ready.

Focus on practical, hands-on knowledge that works on real jobsites. Use an encouraging, mentor-like tone.`

    let response = ''
    let providerLabel: 'claude' | 'openai' | 'openai-fallback' | 'mock' = 'mock'

    // Try Claude first (better for educational content)
    if (anthropicKey && anthropicKey.startsWith('sk-ant-')) {
      try {
        // Attempt Claude first
        
        const anthropic = new Anthropic({
          apiKey: anthropicKey,
        })
        
        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: `${plumbingPrompt}\n\nStudent Question: ${message}\n\nProvide a comprehensive answer with safety, tools, steps, and tips:`
          }]
        })
        
        response = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'No response generated'
        providerLabel = 'claude'
        // Claude success
        
      } catch (claudeError) {
        console.error('Claude API error:', claudeError)
        // Fall back to OpenAI
        if (openaiKey && openaiKey.startsWith('sk-')) {
          try {
            const openai = new OpenAI({ apiKey: openaiKey })
            const openaiResponse = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: plumbingPrompt },
                { role: 'user', content: message }
              ],
              max_tokens: 1000,
              temperature: 0.7
            })
            response = openaiResponse.choices[0].message.content || 'No response generated'
            providerLabel = 'openai-fallback'
          } catch (openaiError) {
            console.error('OpenAI fallback error:', openaiError)
            response = getMockPlumbingResponse(message)
            providerLabel = 'mock'
          }
        } else {
          response = getMockPlumbingResponse(message)
          providerLabel = 'mock'
        }
      }
    } else if (openaiKey && openaiKey.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey })
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: plumbingPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
        response = openaiResponse.choices[0].message.content || 'No response generated'
        providerLabel = 'openai'
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        response = getMockPlumbingResponse(message)
        providerLabel = 'mock'
      }
    } else {
      // No valid keys found; using mock response
      response = getMockPlumbingResponse(message)
      providerLabel = 'mock'
    }

    // Mock video results for plumbing
    const videoResults = [
      {
        id: 'toilet_flange_install',
        title: 'Professional Toilet Flange Installation Guide',
        description: 'Step-by-step toilet flange installation with proper sealing techniques',
        thumbnail: '/api/placeholder/160/90',
        url: '#',
        duration: '12:34',
        source: 'TradeAI Pro'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        sessionId: sessionId || null,
        explanation: response,
        videoResults: videoResults,
        provider: providerLabel,
        confidence: 0.9
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process your question. Please try again.',
      data: {
        explanation: getMockPlumbingResponse('general'),
        videoResults: [],
        provider: 'mock'
      }
    }, { status: 500 })
  }
}

function getMockPlumbingResponse(message: string): string {
  const messageLower = message.toLowerCase()
  
  if (messageLower.includes('toilet') && messageLower.includes('flange')) {
    return `**How to Install a Toilet Flange - Professional Guide**

**🚨 SAFETY FIRST:**
- Wear safety glasses and work gloves
- Ensure proper ventilation 
- Use knee pads for floor work
- Check for gas lines before drilling

**🔧 REQUIRED TOOLS:**
- Measuring tape
- Level  
- Hammer drill with masonry bits
- Screwdriver set
- Utility knife
- Putty knife

**📦 MATERIALS NEEDED:**
- Toilet flange (3" or 4" depending on pipe)
- Mounting screws (usually 1/4" x 3")
- PVC primer and cement (if using PVC)
- Wax ring (for toilet installation)

**📋 STEP-BY-STEP INSTALLATION:**

**Step 1: Prepare the Area**
- Turn off water supply and remove old toilet
- Clean the drain opening thoroughly
- Check that drain pipe is properly supported

**Step 2: Measure and Position**
- Flange should sit ON TOP of finished floor
- Measure drain pipe diameter (3" or 4")
- Position flange so bolt slots align with wall behind toilet

**Step 3: Secure the Flange**
- Mark screw holes on floor
- Drill pilot holes into subfloor/concrete
- Attach flange with appropriate screws
- Ensure flange is level and secure

**Step 4: Test the Installation**
- Check that flange doesn't rock or move
- Verify bolt slots are properly positioned
- Clean any debris from flange opening

**⚠️ CODE COMPLIANCE:**
- Flange must be secured to structural floor
- Check local codes for specific requirements
- Some areas require metal flanges for certain applications

**💡 PRO TIPS:**
- Never install flange below floor level
- Use stainless steel screws in wet areas
- Double-check measurements before drilling
- Keep flange opening clear during installation

**❌ COMMON MISTAKES TO AVOID:**
- Installing flange too low (below floor surface)
- Not securing properly to subfloor
- Using wrong size flange for drain pipe
- Forgetting to check for level installation

**Next Steps:** Once flange is installed, you'll need a new wax ring and proper toilet mounting hardware for toilet reinstallation.`
  }
  
  if (messageLower.includes('leak') || messageLower.includes('repair')) {
    return `**Water Leak Detection and Repair Guide**

**🚨 SAFETY FIRST:**
- Turn off water supply immediately if major leak
- Wear safety glasses and gloves
- Be cautious around electrical outlets near water
- Use non-slip footwear in wet areas

**🔍 LEAK DETECTION STEPS:**

**Step 1: Locate the Source**
- Follow water trail to highest point
- Check all visible pipes and fittings
- Look for water stains or mineral deposits
- Use flashlight to inspect dark areas

**Step 2: Common Leak Locations**
- Pipe joints and fittings
- Valve stems and packing
- Toilet base and tank connections
- Faucet aerators and cartridges

**🔧 BASIC REPAIR TOOLS:**
- Pipe wrench set
- Adjustable wrench
- Plumber's tape (Teflon tape)
- Pipe compound/dope
- Replacement washers and O-rings

**⚠️ WHEN TO CALL A PROFESSIONAL:**
- Leaks behind walls
- Gas line issues
- Major pipe replacement
- If you're not comfortable with the repair

Professional plumbers have specialized tools and experience for complex repairs.`
  }

  // Default response for any plumbing question
  return `**TradeAI Tutor - Plumbing Guidance**

Thank you for your plumbing question! I'm here to help you learn proper techniques with a focus on safety and code compliance.

**🚨 SAFETY REMINDER:**
- Always wear appropriate PPE (safety glasses, gloves)
- Turn off water/gas supplies when working
- Check local codes before starting work
- When in doubt, consult a licensed professional

**📚 LEARNING APPROACH:**
I provide step-by-step guidance covering:
- Required tools and materials
- Safety procedures and warnings  
- Code compliance requirements
- Professional tips and tricks
- Common mistakes to avoid

**💡 ASK SPECIFIC QUESTIONS:**
For the best guidance, ask specific questions like:
- "How do I install a toilet flange?"
- "What size pipe for kitchen sink drain?"
- "How to fix a leaky faucet cartridge?"
- "What's the proper venting for bathroom?"

I'm ready to help you master plumbing skills safely and professionally!`
}

export async function GET() {
  return NextResponse.json({ 
    message: 'TradeAI Tutor Chat API endpoint - POST your plumbing questions here',
    status: 'online',
    apiKeys: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  })
}