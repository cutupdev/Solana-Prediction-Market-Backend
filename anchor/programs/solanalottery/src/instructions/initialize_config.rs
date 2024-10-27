use crate::{constants::TOKEN_LOTTERY_CONFIG, LotteryConfig};
use anchor_lang::prelude::*;

pub fn initialize_config(
    ctx: Context<InitializeConfig>,
    lottery_id: u64,
    start: u64,
    end: u64,
    price: u64,
) -> Result<()> {
    let signer = &mut ctx.accounts.payer;
    let token_lottery = &mut ctx.accounts.token_lottery;

    token_lottery.lottery_id = lottery_id;
    token_lottery.bump = ctx.bumps.token_lottery;
    token_lottery.lottery_start = start;
    token_lottery.lottery_end = end;
    token_lottery.price = price;
    token_lottery.authority = signer.key();
    token_lottery.randomness_account = Pubkey::default();

    token_lottery.ticket_num = 0;
    token_lottery.winner_chosen = false;

    Ok(())
}

#[derive(Accounts)]
#[instruction(lottery_id : u64)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + LotteryConfig::INIT_SPACE,
        // Challenge: Make this be able to run more than 1 lottery at a time
        seeds = [TOKEN_LOTTERY_CONFIG.as_ref(), payer.key().as_ref(), &lottery_id.to_be_bytes()],
        bump
    )]
    pub token_lottery: Box<Account<'info, LotteryConfig>>,

    pub system_program: Program<'info, System>,
}
