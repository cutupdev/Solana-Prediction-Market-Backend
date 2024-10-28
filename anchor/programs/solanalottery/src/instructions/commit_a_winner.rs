use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::{constants::TOKEN_LOTTERY_CONFIG, LotteryConfig};
use switchboard_on_demand::accounts::RandomnessAccountData;


pub fn commit_a_winner(ctx: Context<CommitWinner>, _lottery_id: u64) -> Result<()> {
  
    let clock = Clock::get()?;

    let token_lottery = &mut ctx.accounts.token_lottery;

    if ctx.accounts.payer.key() != token_lottery.authority {
        return Err(ErrorCode::NotAuthorized.into());
    }

    let randomness_data = RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow()).unwrap();

    if randomness_data.seed_slot != clock.slot - 1 {
        return Err(ErrorCode::RandomnessAlreadyRevealed.into());
    }

    token_lottery.randomness_account = ctx.accounts.randomness_account_data.key();


    Ok(())
}

#[derive(Accounts)]
#[instruction(_lottery_id : u64)]
pub struct CommitWinner<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut, 
           seeds = [TOKEN_LOTTERY_CONFIG.as_ref(), payer.key().as_ref(), &_lottery_id.to_be_bytes()],
           bump
       )]
       pub token_lottery: Box<Account<'info, LotteryConfig>>,


    /// CHECK: The account's data is validated manually within the handler.
    pub randomness_account_data: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
