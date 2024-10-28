use anchor_lang::prelude::*;
use crate::constants::*;
use crate::LotteryConfig;
use crate::errors::ErrorCode;
use switchboard_on_demand::accounts::RandomnessAccountData;

pub fn choose_winner(ctx: Context<ChooseWinner>, _lottery_id: u64) -> Result<()> {
    let clock = Clock::get()?;
    let token_lottery = &mut ctx.accounts.token_lottery;

    if ctx.accounts.randomness_account_data.key() != token_lottery.randomness_account {
        return Err(ErrorCode::IncorrectRandomnessAccount.into());
    }
    if ctx.accounts.payer.key() != token_lottery.authority {
        return Err(ErrorCode::NotAuthorized.into());
    }
    if clock.slot < token_lottery.lottery_end {
        msg!("Current slot: {}", clock.slot);
        msg!("End slot: {}", token_lottery.lottery_end);
        return Err(ErrorCode::LotteryNotCompleted.into());
    }
    require!(token_lottery.winner_chosen == false, ErrorCode::WinnerChosen);

    let randomness_data = 
        RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow()).unwrap();
    let revealed_random_value = randomness_data.get_value(&clock)
        .map_err(|_| ErrorCode::RandomnessNotResolved)?;

    msg!("Randomness result: {}", revealed_random_value[0]);
    msg!("Ticket num: {}", token_lottery.ticket_num);

    let randomness_result = 
        revealed_random_value[0] as u64 % token_lottery.ticket_num;

    msg!("Winner: {}", randomness_result);

    token_lottery.winner = randomness_result;
    token_lottery.winner_chosen = true;

    Ok(())
}

#[derive(Accounts)]
#[instruction(_lottery_id : u64)]
pub struct ChooseWinner<'info> {
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
